from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.auth import get_current_user, hash_password
from app.database import get_db
from app.models import User
from app.models.user import UserRole
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(User))
    users = list(result.scalars().all())
    return [UserResponse(id=u.id, name=u.name, username=u.username, role=u.role, parent_id=u.parent_id) for u in users]


@router.get("/me", response_model=UserResponse)
async def me(current: Annotated[User, Depends(get_current_user)]):
    return UserResponse(id=current.id, name=current.name, username=current.username, role=current.role, parent_id=current.parent_id)


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
    parent_ok = data.parent_id is None or (await db.execute(select(User).where(User.id == data.parent_id))).scalar_one_or_none()
    if data.parent_id and not parent_ok:
        raise HTTPException(status_code=400, detail="Parent user not found")
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        name=data.name,
        username=data.username,
        password_hash=hash_password(data.password),
        role=data.role,
        parent_id=data.parent_id,
    )
    db.add(user)
    await db.flush()
    from app.models import UserBalance
    db.add(UserBalance(user_id=user_id, balance=0, locked_balance=0))
    await db.flush()
    return UserResponse(id=user.id, name=user.name, username=user.username, role=user.role, parent_id=user.parent_id)


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
    return UserResponse(id=user.id, name=user.name, username=user.username, role=user.role, parent_id=user.parent_id)


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
    if data.name is not None:
        user.name = data.name
    if data.username is not None:
        user.username = data.username
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    if data.role is not None:
        user.role = data.role
    if data.parent_id is not None:
        user.parent_id = data.parent_id
    await db.flush()
    return UserResponse(id=user.id, name=user.name, username=user.username, role=user.role, parent_id=user.parent_id)


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
