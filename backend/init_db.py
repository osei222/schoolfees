"""
Database Initialization Script
Run this to create database tables and add sample data
"""

from app.database import engine, Base, SessionLocal
from app.models import User, SubscriptionPlan, SubscriptionStatus
from app.services.auth_service import get_password_hash, calculate_subscription_end_date
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Create all database tables"""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully!")

def create_sample_user():
    """Create a sample user for testing"""
    db = SessionLocal()
    try:
        # Check if sample user exists
        existing = db.query(User).filter(User.username == "demo").first()
        if existing:
            logger.info("⚠️  Sample user 'demo' already exists")
            return
        
        # Create sample user
        subscription_end = calculate_subscription_end_date(SubscriptionPlan.FREE_TRIAL)
        
        demo_user = User(
            username="demo",
            email="demo@school.com",
            hashed_password=get_password_hash("demo123"),
            school_name="Demo School",
            phone="0241234567",
            address="123 Demo Street, Accra",
            subscription_plan=SubscriptionPlan.FREE_TRIAL,
            subscription_status=SubscriptionStatus.ACTIVE,
            subscription_end_date=subscription_end,
            wallet_balance=100.0,  # GHS 100 for testing
            sms_balance=50,  # 50 free SMS
            arkesel_sender_id="DemoSchool"
        )
        
        db.add(demo_user)
        db.commit()
        
        logger.info("✅ Sample user created successfully!")
        logger.info(f"   Username: demo")
        logger.info(f"   Password: demo123")
        logger.info(f"   School: Demo School")
        logger.info(f"   Wallet: GHS 100.00")
        logger.info(f"   SMS Balance: 50 units")
        
    except Exception as e:
        logger.error(f"❌ Error creating sample user: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("="*60)
    print("School Fee Management System - Database Initialization")
    print("="*60)
    
    try:
        # Create tables
        init_database()
        
        # Ask if user wants sample data
        create_sample = input("\n📊 Create sample user for testing? (y/n): ").lower()
        if create_sample == 'y':
            create_sample_user()
        
        print("\n" + "="*60)
        print("✅ Database initialization complete!")
        print("="*60)
        print("\n🚀 Next steps:")
        print("1. Start the server: uvicorn app.main:app --reload")
        print("2. Go to: http://localhost:8000/docs")
        print("3. Try the sample user:")
        print("   - Username: demo")
        print("   - Password: demo123")
        print("="*60)
        
    except Exception as e:
        logger.error(f"❌ Initialization failed: {e}")
        print("\n⚠️  Make sure:")
        print("1. PostgreSQL is running")
        print("2. Database 'school_fee_management' exists")
        print("3. .env file has correct DATABASE_URL")

if __name__ == "__main__":
    main()
