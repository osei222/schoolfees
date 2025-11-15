"""
Setup and Test Script for School Fee Management Backend
Run this to verify your backend setup
"""

import sys
import subprocess
import os

def check_python_version():
    """Check if Python version is 3.9+"""
    print("✓ Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 9:
        print(f"  Python {version.major}.{version.minor}.{version.micro} ✓")
        return True
    else:
        print(f"  ✗ Python 3.9+ required, found {version.major}.{version.minor}")
        return False

def check_postgresql():
    """Check if PostgreSQL is accessible"""
    print("\n✓ Checking PostgreSQL...")
    try:
        import psycopg2
        print("  psycopg2 installed ✓")
        return True
    except ImportError:
        print("  ✗ psycopg2 not installed")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("\n✓ Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("  Dependencies installed ✓")
        return True
    except subprocess.CalledProcessError:
        print("  ✗ Failed to install dependencies")
        return False

def check_env_file():
    """Check if .env file exists"""
    print("\n✓ Checking environment configuration...")
    if os.path.exists(".env"):
        print("  .env file found ✓")
        return True
    else:
        print("  ✗ .env file not found")
        print("  Creating .env from .env.example...")
        if os.path.exists(".env.example"):
            import shutil
            shutil.copy(".env.example", ".env")
            print("  .env created ✓")
            print("  ⚠ Please edit .env with your database credentials")
            return True
        return False

def test_imports():
    """Test if all required modules can be imported"""
    print("\n✓ Testing imports...")
    try:
        import fastapi
        import sqlalchemy
        import jose
        import passlib
        import httpx
        print("  All imports successful ✓")
        return True
    except ImportError as e:
        print(f"  ✗ Import error: {e}")
        return False

def print_next_steps():
    """Print next steps for user"""
    print("\n" + "="*60)
    print("SETUP COMPLETE!")
    print("="*60)
    print("\n📋 NEXT STEPS:\n")
    print("1. Create PostgreSQL database:")
    print("   CREATE DATABASE school_fee_management;")
    print("\n2. Update .env file with your database credentials:")
    print("   DATABASE_URL=postgresql://user:pass@localhost:5432/school_fee_management")
    print("\n3. Start the server:")
    print("   uvicorn app.main:app --reload")
    print("\n4. Open API documentation:")
    print("   http://localhost:8000/docs")
    print("\n5. Test the API:")
    print("   - Register a new school: POST /auth/register")
    print("   - Login: POST /auth/login")
    print("   - Top up wallet: POST /wallet/topup")
    print("   - Send SMS: POST /sms/send")
    print("\n" + "="*60)

def main():
    """Run all checks"""
    print("="*60)
    print("School Fee Management Backend - Setup Verification")
    print("="*60)
    
    checks = [
        check_python_version(),
        check_env_file(),
    ]
    
    if all(checks):
        if not os.path.exists("app"):
            print("\n✗ 'app' directory not found. Are you in the backend directory?")
            sys.exit(1)
        
        install_deps = input("\n📦 Install dependencies now? (y/n): ").lower()
        if install_deps == 'y':
            install_dependencies()
            test_imports()
        
        print_next_steps()
    else:
        print("\n✗ Setup verification failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
