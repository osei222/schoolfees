from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username, school_id=payload.get("school_id"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception

    if token_data.school_id and user.school_id and token_data.school_id != user.school_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tenant mismatch detected")
    
    # Check if subscription is expired
    if user.subscription_end_date and user.subscription_end_date < datetime.now():
        if user.subscription_status == models.SubscriptionStatus.ACTIVE:
            user.subscription_status = models.SubscriptionStatus.EXPIRED
            db.commit()
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user

async def get_current_active_subscription(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Check if user has active subscription"""
    if current_user.subscription_status != models.SubscriptionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your subscription has expired. Please renew to continue."
        )
    return current_user

def check_sms_limit(user: models.User) -> bool:
    """Check if user has SMS credits"""
    if user.sms_balance <= 0:
        return False
    
    # Free trial SMS limit
    if user.subscription_plan == models.SubscriptionPlan.FREE_TRIAL:
        if user.sms_balance > settings.FREE_TRIAL_SMS_LIMIT:
            return False
    
    return True

def calculate_subscription_end_date(plan: models.SubscriptionPlan) -> datetime:
    """Calculate subscription end date based on plan"""
    if plan == models.SubscriptionPlan.FREE_TRIAL:
        return datetime.now() + timedelta(days=settings.FREE_TRIAL_DAYS)
    else:
        # Monthly subscription
        return datetime.now() + timedelta(days=30)


async def require_active_school(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> models.School:
    """Ensure the current user belongs to an active school/tenant."""
    if not current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No school is associated with this account. Please contact support."
        )

    school = db.query(models.School).filter(models.School.id == current_user.school_id).first()
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found or has been removed."
        )

    if not school.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="School account is inactive. Please renew subscription."
        )

    return school
