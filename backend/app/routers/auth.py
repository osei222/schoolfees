from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    calculate_subscription_end_date
)
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Temporary store for reset codes (use Redis or DB in production)
reset_codes = {}


@router.post("/register-school", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def register_school(reg_data: schemas.SchoolRegistration, db: Session = Depends(get_db)):
    """Register a new school (tenant) with an admin user"""
    # Check subdomain availability
    existing_school = db.query(models.School).filter(models.School.subdomain == reg_data.subdomain.lower()).first()
    if existing_school:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subdomain already taken")

    # Check admin email
    existing_user = db.query(models.User).filter(models.User.email == reg_data.admin_email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin email already registered")

    # Create school
    school = models.School(
        name=reg_data.school_name,
        subdomain=reg_data.subdomain.lower(),
        address=reg_data.school_address,
        phone=reg_data.school_phone,
        email=reg_data.school_email,
        subscription_plan=models.SubscriptionPlan.FREE_TRIAL,
        is_active=True
    )
    db.add(school)
    db.flush()  # to get school.id

    # Create admin user
    admin_user = models.User(
        username=reg_data.admin_username.lower(),
        email=reg_data.admin_email,
        hashed_password=get_password_hash(reg_data.admin_password),
        school_name=reg_data.school_name,
        phone=reg_data.admin_phone,
        subscription_plan=models.SubscriptionPlan.FREE_TRIAL,
        subscription_status=models.SubscriptionStatus.ACTIVE,
        subscription_end_date=calculate_subscription_end_date(models.SubscriptionPlan.FREE_TRIAL),
        sms_balance=settings.FREE_TRIAL_SMS_LIMIT,
        school_id=school.id
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    db.refresh(school)

    # Create token including school_id
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin_user.username, "school_id": school.id},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": admin_user, "school": school}

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user under an existing school/tenant"""
    school = db.query(models.School).filter(models.School.subdomain == user_data.school_subdomain.lower()).first()
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School subdomain not found")

    if not school.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="School subscription is inactive")

    # Check unique username/email
    existing_user = db.query(models.User).filter(models.User.username == user_data.username.lower()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    existing_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Mirror subscription context from an existing school user (usually the admin)
    subscription_source = (
        db.query(models.User)
        .filter(models.User.school_id == school.id)
        .order_by(models.User.created_at.asc())
        .first()
    )

    subscription_plan = subscription_source.subscription_plan if subscription_source else models.SubscriptionPlan.FREE_TRIAL
    subscription_status = subscription_source.subscription_status if subscription_source else models.SubscriptionStatus.ACTIVE
    subscription_end_date = (
        subscription_source.subscription_end_date
        if subscription_source and subscription_source.subscription_end_date
        else calculate_subscription_end_date(subscription_plan)
    )
    wallet_balance = (
        subscription_source.wallet_balance
        if subscription_source and subscription_source.wallet_balance is not None
        else 0.0
    )
    sms_balance = (
        subscription_source.sms_balance
        if subscription_source and subscription_source.sms_balance is not None
        else settings.FREE_TRIAL_SMS_LIMIT
    )

    new_user = models.User(
        username=user_data.username.lower(),
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        school_name=school.name,
        school_id=school.id,
        phone=user_data.phone,
        address=user_data.address,
        subscription_plan=subscription_plan,
        subscription_status=subscription_status,
        subscription_end_date=subscription_end_date,
        wallet_balance=wallet_balance,
        sms_balance=sms_balance
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username, "school_id": school.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
        "school": school
    }

@router.post("/login", response_model=schemas.Token)
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login with username and password
    Returns JWT token for authenticated requests
    """
    # Support login via username or email
    user = None
    if credentials.email:
        user = db.query(models.User).filter(models.User.email == credentials.email).first()
    elif credentials.username:
        user = db.query(models.User).filter(models.User.username == credentials.username.lower()).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # If subdomain provided, ensure user belongs to that school
    if credentials.subdomain and user.school_id:
        sch = db.query(models.School).filter(models.School.id == user.school_id).first()
        if not sch or sch.subdomain != credentials.subdomain.lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials for this school")

    # Create access token including school claim when available
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": user.username}
    if user.school_id:
        token_data["school_id"] = user.school_id

    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)

    school_obj = None
    if user.school_id:
        school_obj = db.query(models.School).filter(models.School.id == user.school_id).first()

    return {"access_token": access_token, "token_type": "bearer", "user": user, "school": school_obj}

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
async def update_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if user_update.school_name:
        current_user.school_name = user_update.school_name
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.address:
        current_user.address = user_update.address
    if user_update.arkesel_sender_id:
        if len(user_update.arkesel_sender_id) > 11:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sender ID must be 11 characters or less"
            )
        current_user.arkesel_sender_id = user_update.arkesel_sender_id
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
async def forgot_password(data: schemas.ForgotPassword, db: Session = Depends(get_db)):
    """
    Request password reset
    In production, this should send an email with a reset token
    For now, returns a temporary reset code
    """
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If the email exists, a reset code has been sent"}
    
    # Generate a simple reset code (in production, use proper token generation)
    import random, string
    reset_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    reset_codes[data.email] = {"code": reset_code}

    return {"message": "If the email exists, a reset code has been sent", "reset_code": reset_code}

@router.post("/reset-password")
async def reset_password(data: schemas.ResetPassword, db: Session = Depends(get_db)):
    """
    Reset password using reset code
    In production, validate the reset token properly
    """
    user = db.query(models.User).filter(models.User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate reset code
    if data.email not in reset_codes or reset_codes[data.email]["code"] != data.reset_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset code")

    user.hashed_password = get_password_hash(data.new_password)
    # remove used code
    del reset_codes[data.email]
    db.commit()

    return {"message": "Password reset successfully"}
