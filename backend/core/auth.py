from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings
from .db import get_db

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_access_token(subject: str, extra: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRY_DAYS)
    payload = {"sub": subject, "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2)) -> dict:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise cred_exc
    except JWTError:
        raise cred_exc

    db = get_db()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise cred_exc
    return user


async def get_current_salon(user: dict = Depends(get_current_user)) -> dict:
    db = get_db()
    salon = await db.salons.find_one({"_id": user["salon_id"]})
    if not salon:
        raise HTTPException(status_code=403, detail="Salon not found")
    if salon.get("subscription_status") not in ("active", "trialing"):
        raise HTTPException(status_code=402, detail="Subscription inactive")
    if not salon.get("member_agreement_accepted_at"):
        raise HTTPException(status_code=403, detail="Member agreement not accepted")
    return salon
