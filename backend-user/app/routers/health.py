from fastapi import APIRouter

router = APIRouter()


@router.get("")
def health():
    return {"status": "ok", "service": "user-onboarding"}


@router.get("/live")
def liveness():
    return {"status": "ok"}
