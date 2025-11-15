from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "School Fee Management System"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Arkesel SMS
    ARKESEL_API_KEY: str = "TlZMTndiYXZzaXJtWWxkTFJOdVI"
    ARKESEL_SENDER_ID: str = "CodelabSMS"
    ARKESEL_API_URL: str = "https://sms.arkesel.com/sms/api"
    
    # Paystack Payment Gateway
    PAYSTACK_PUBLIC_KEY: str = "pk_test_7a592687934d03a5693f3dd55d148c413ea944a8"
    PAYSTACK_SECRET_KEY: str = "sk_test_7a592687934d03a5693f3dd55d148c413ea944a8"  # Replace with your secret key
    
    # Frontend URL for callbacks
    FRONTEND_URL: str = "http://localhost:5173"
    
    # SMS Pricing
    SMS_COST_PER_UNIT: float = 0.20
    
    # Subscription Plans
    FREE_TRIAL_DAYS: int = 10
    FREE_TRIAL_SMS_LIMIT: int = 20
    BASIC_PLAN_MONTHLY: float = 200.00
    PREMIUM_PLAN_MONTHLY: float = 300.00
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse ALLOWED_ORIGINS as a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
