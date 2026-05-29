from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.auth import get_current_user, hash_password
from app.database import get_db
from app.models import User
from app.models.user import UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate, MeUpdate, ChangePasswordRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
    role: UserRole | None = Query(None, description="Filter by role"),
    parent_id: str | None = Query(None, description="Filter by parent user id"),
    search: str | None = Query(None, description="Search in username and name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """List users. Admin sees all; master sees self + children; agent sees only self."""
    q = select(User)
    if current.role == UserRole.agent:
        q = q.where(User.id == current.id)
    elif current.role == UserRole.master:
        q = q.where(or_(User.id == current.id, User.parent_id == current.id))
    # admin: no extra filter
    if role is not None:
        q = q.where(User.role == role)
    if parent_id is not None:
        q = q.where(User.parent_id == parent_id)
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.where(or_(User.username.ilike(term), User.name.ilike(term)))
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    users = list(result.scalars().all())
    return [UserResponse.model_validate(u) for u in users]


@router.get("/me", response_model=UserResponse)
async def me(current: Annotated[User, Depends(get_current_user)]):
    return UserResponse.model_validate(current)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: MeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Update own profile (name and/or password). For password change, current_password is required."""
    if data.name is not None:
        current.name = data.name
    if data.new_password is not None:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="current_password required to set new_password")
        from app.auth import verify_password
        if not verify_password(data.current_password, current.password_hash):
            raise HTTPException(status_code=400, detail="current_password is incorrect")
        current.password_hash = hash_password(data.new_password)
    await db.flush()
    return UserResponse.model_validate(current)


@router.post("/me/change-password")
async def change_password_me(
    data: ChangePasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Change own password. Requires current password."""
    from app.auth import verify_password
    if not verify_password(data.current_password, current.password_hash):
        raise HTTPException(status_code=400, detail="current_password is incorrect")
    current.password_hash = hash_password(data.new_password)
    await db.flush()
    return {"ok": True}


@router.post("", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if current.role != UserRole.admin and current.role != UserRole.master:
        raise HTTPException(status_code=403, detail="Only admin or master can create users")
    existing = await db.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    parent = None
    if data.parent_id:
        parent_res = await db.execute(select(User).where(User.id == data.parent_id))
        parent = parent_res.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent user not found")
    user_id = str(uuid.uuid4())
    cr = data.commission_rate if data.commission_rate is not None else 10
    tbl = data.total_bet_limit if data.total_bet_limit is not None else 5_000_000
    snl = data.single_number_limit if data.single_number_limit is not None else 500_000
    p2d = data.payout_2d if data.payout_2d is not None else 80
    p3d = data.payout_3d if data.payout_3d is not None else 500
    if parent and data.role == UserRole.agent:
        pcr = (parent.commission_rate or 17)
        ptbl = (parent.total_bet_limit or 10_000_000)
        psnl = (parent.single_number_limit or 1_000_000)
        pp2d = parent.payout_2d or 85
        pp3d = parent.payout_3d or 500
        if cr > pcr:
            raise HTTPException(status_code=400, detail=f"Commission rate cannot exceed parent's rate ({pcr}%)")
        if tbl > ptbl:
            raise HTTPException(status_code=400, detail="Total bet limit cannot exceed parent's limit")
        if snl > psnl:
            raise HTTPException(status_code=400, detail="Single number limit cannot exceed parent's limit")
        if p2d > pp2d:
            raise HTTPException(status_code=400, detail="2D payout cannot exceed parent's rate")
        if p3d > pp3d:
            raise HTTPException(status_code=400, detail="3D payout cannot exceed parent's rate")
    user = User(
        id=user_id,
        name=data.name,
        username=data.username,
        password_hash=hash_password(data.password),
        role=data.role,
        parent_id=data.parent_id,
        commission_rate=cr,
        total_bet_limit=tbl,
        single_number_limit=snl,
        payout_2d=p2d,
        payout_3d=p3d,
    )
    db.add(user)
    await db.flush()
    from app.models import UserBalance
    db.add(UserBalance(user_id=user_id, balance=0, locked_balance=0))
    await db.flush()
    return UserResponse.model_validate(user)


def _can_access_user(current: User, target_id: str, target_parent_id: str | None) -> bool:
    """Admin: all; master: self or children; agent: only self."""
    if current.role == UserRole.admin:
        return True
    if current.id == target_id:
        return True
    if current.role == UserRole.master and target_parent_id == current.id:
        return True
    return False


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not _can_access_user(current, user.id, user.parent_id):
        raise HTTPException(status_code=403, detail="Not allowed to access this user")
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not _can_access_user(current, user.id, user.parent_id):
        raise HTTPException(status_code=403, detail="Not allowed to update this user")
    if current.role != UserRole.admin and (data.role is not None or data.parent_id is not None):
        raise HTTPException(status_code=403, detail="Only admin can change role or parent_id")
    if data.name is not None:
        user.name = data.name
    if data.username is not None:
        other = await db.execute(select(User).where(User.username == data.username, User.id != user.id))
        if other.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already exists")
        user.username = data.username
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    if data.role is not None:
        user.role = data.role
    if data.parent_id is not None:
        user.parent_id = data.parent_id
    if data.commission_rate is not None:
        if user.parent_id and user.role == UserRole.agent:
            parent_res = await db.execute(select(User).where(User.id == user.parent_id))
            parent = parent_res.scalar_one_or_none()
            if parent and data.commission_rate > (parent.commission_rate or 17):
                raise HTTPException(status_code=400, detail=f"Commission rate cannot exceed parent's rate ({parent.commission_rate or 17}%)")
        user.commission_rate = data.commission_rate
    if data.total_bet_limit is not None:
        if user.parent_id and user.role == UserRole.agent:
            parent_res = await db.execute(select(User).where(User.id == user.parent_id))
            parent = parent_res.scalar_one_or_none()
            if parent and data.total_bet_limit > (parent.total_bet_limit or 10_000_000):
                raise HTTPException(status_code=400, detail="Total bet limit cannot exceed parent's limit")
        user.total_bet_limit = data.total_bet_limit
    if data.single_number_limit is not None:
        if user.parent_id and user.role == UserRole.agent:
            parent_res = await db.execute(select(User).where(User.id == user.parent_id))
            parent = parent_res.scalar_one_or_none()
            if parent and data.single_number_limit > (parent.single_number_limit or 1_000_000):
                raise HTTPException(status_code=400, detail="Single number limit cannot exceed parent's limit")
        user.single_number_limit = data.single_number_limit
    if data.payout_2d is not None:
        if user.parent_id and user.role == UserRole.agent:
            parent_res = await db.execute(select(User).where(User.id == user.parent_id))
            parent = parent_res.scalar_one_or_none()
            if parent and data.payout_2d > (parent.payout_2d or 85):
                raise HTTPException(status_code=400, detail="2D payout cannot exceed parent's rate")
        user.payout_2d = data.payout_2d
    if data.payout_3d is not None:
        if user.parent_id and user.role == UserRole.agent:
            parent_res = await db.execute(select(User).where(User.id == user.parent_id))
            parent = parent_res.scalar_one_or_none()
            if parent and data.payout_3d > (parent.payout_3d or 500):
                raise HTTPException(status_code=400, detail="3D payout cannot exceed parent's rate")
        user.payout_3d = data.payout_3d
    await db.flush()
    return UserResponse.model_validate(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    if current.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only admin can delete users")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    return {"ok": True}
