"""Bank accounts CRUD for agent/master/admin users."""
from pathlib import Path
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import User, BankAccount
from app.models.user import UserRole
from app.schemas.bank_account import BankAccountUpdate, BankAccountResponse

router = APIRouter(prefix="/bank-accounts", tags=["bank-accounts"])

_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def _get_upload_dir() -> Path:
    d = settings.upload_dir_resolved
    d.mkdir(parents=True, exist_ok=True)
    return d


def _qr_full_url(stored_path: str | None) -> str | None:
    """Combine base_url with stored path to return full URL."""
    if not stored_path:
        return None
    base = (settings.base_url or "").rstrip("/")
    path = stored_path.lstrip("/")
    return f"{base}/uploads/{path}" if base and path else None


def _to_response(b: BankAccount) -> BankAccountResponse:
    return BankAccountResponse(
        id=b.id,
        user_id=b.user_id,
        payment_method=b.payment_method,
        account_name=b.account_name,
        account_number=b.account_number,
        bank_name=b.bank_name,
        qr_code_url=_qr_full_url(b.qr_code_url),
        is_primary=b.is_primary,
        created_at=b.created_at.isoformat() if hasattr(b.created_at, "isoformat") else str(b.created_at),
    )


@router.get("", response_model=list[BankAccountResponse])
async def list_my_bank_accounts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """List current user's bank accounts."""
    result = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id).order_by(BankAccount.created_at))
    rows = result.scalars().all()
    return [_to_response(r) for r in rows]


@router.get("/parent", response_model=list[BankAccountResponse])
async def list_parent_bank_accounts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """List parent user's bank accounts for deposit/Buy Units flow. Downline only see payment methods their upline has."""
    if not current.parent_id:
        return []
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == current.parent_id).order_by(BankAccount.created_at)
    )
    rows = result.scalars().all()
    return [_to_response(r) for r in rows]


@router.post("", response_model=BankAccountResponse)
async def create_bank_account(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
    payment_method: Annotated[str, Form()] = "",
    account_name: Annotated[str, Form()] = "",
    account_number: Annotated[str, Form()] = "",
    bank_name: Annotated[str | None, Form()] = None,
    is_primary: Annotated[bool, Form()] = False,
    qr_file: Annotated[UploadFile | None, File()] = None,
):
    """Add a bank account for the current user. Use multipart/form-data for qr_file."""
    qr_stored_path: str | None = None
    if qr_file and qr_file.filename:
        ext = Path(qr_file.filename).suffix.lower()
        if ext not in _ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Invalid image type. Allowed: {list(_ALLOWED_EXTENSIONS)}")
        unique_name = f"{uuid.uuid4().hex}{ext}"
        upload_dir = _get_upload_dir()
        dest = upload_dir / unique_name
        content = await qr_file.read()
        dest.write_bytes(content)
        # Store path relative to uploads mount (e.g. bank-qr/xxx.jpg)
        subdir = settings.upload_dir_resolved.name
        qr_stored_path = f"{subdir}/{unique_name}"

    if is_primary:
        result = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id))
        for row in result.scalars().all():
            row.is_primary = False
    acc = BankAccount(
        id=str(uuid.uuid4()),
        user_id=current.id,
        payment_method=payment_method,
        account_name=account_name,
        account_number=account_number,
        bank_name=bank_name or None,
        qr_code_url=qr_stored_path,
        is_primary=is_primary,
    )
    db.add(acc)
    await db.flush()
    return _to_response(acc)


@router.post("/{account_id}/qr", response_model=BankAccountResponse)
async def upload_qr_for_account(
    account_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
    qr_file: Annotated[UploadFile, File()],
):
    """Upload QR image for a bank account. Use multipart/form-data."""
    result = await db.execute(select(BankAccount).where(BankAccount.id == account_id, BankAccount.user_id == current.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    if not qr_file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = Path(qr_file.filename).suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid image type. Allowed: {list(_ALLOWED_EXTENSIONS)}")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    upload_dir = _get_upload_dir()
    dest = upload_dir / unique_name
    content = await qr_file.read()
    dest.write_bytes(content)
    subdir = settings.upload_dir_resolved.name
    acc.qr_code_url = f"{subdir}/{unique_name}"
    await db.flush()
    return _to_response(acc)


@router.patch("/{account_id}", response_model=BankAccountResponse)
async def update_bank_account(
    account_id: str,
    data: BankAccountUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Update a bank account (must belong to current user). Text fields only; use POST .../qr for image."""
    result = await db.execute(select(BankAccount).where(BankAccount.id == account_id, BankAccount.user_id == current.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    if data.payment_method is not None:
        acc.payment_method = data.payment_method
    if data.account_name is not None:
        acc.account_name = data.account_name
    if data.account_number is not None:
        acc.account_number = data.account_number
    if data.bank_name is not None:
        acc.bank_name = data.bank_name
    # qr_code_url not updated via PATCH; use POST .../qr for image upload
    if data.is_primary is True:
        # Unset other primary
        r2 = await db.execute(select(BankAccount).where(BankAccount.user_id == current.id, BankAccount.id != account_id))
        for row in r2.scalars().all():
            row.is_primary = False
        acc.is_primary = True
    elif data.is_primary is False:
        acc.is_primary = False
    return _to_response(acc)


@router.delete("/{account_id}")
async def delete_bank_account(
    account_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_user)],
):
    """Delete a bank account (must belong to current user)."""
    result = await db.execute(select(BankAccount).where(BankAccount.id == account_id, BankAccount.user_id == current.id))
    acc = result.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
    await db.delete(acc)
    return {"ok": True}
