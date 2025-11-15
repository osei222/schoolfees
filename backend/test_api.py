"""
Quick API Test Script
Run this after starting the server to test endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_register():
    """Test school registration"""
    print("\n📝 Testing user registration...")
    data = {
        "school_name": "Test School 123",
        "subdomain": "testschool123",
        "school_address": "123 Avenue, Accra",
        "school_phone": "0241234567",
        "school_email": "info@testschool123.com",
        "admin_username": "testschool123",
        "admin_email": "test123@school.com",
        "admin_password": "secure123",
        "admin_full_name": "Test Admin",
        "admin_phone": "0241234567"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register-school", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"✅ Registration successful!")
        print(f"Username: {result['user']['username']}")
        print(f"School: {result['school']['name']}")
        print(f"SMS Balance: {result['user']['sms_balance']}")
        print(f"Subscription: {result['user']['subscription_plan']}")
        return result['access_token']
    else:
        print(f"❌ Registration failed: {response.text}")
        return None

def test_login():
    """Test user login"""
    print("\n🔐 Testing user login...")
    data = {
        "username": "testschool123",
        "password": "secure123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Login successful!")
        print(f"Token: {result['access_token'][:50]}...")
        return result['access_token']
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_wallet_balance(token):
    """Test wallet balance check"""
    print("\n💰 Testing wallet balance...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/wallet/balance", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Wallet Balance: GHS {result['wallet_balance']}")
        print(f"   SMS Balance: {result['sms_balance']} units")
        print(f"   Subscription: {result['subscription_plan']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_wallet_topup(token):
    """Test wallet top-up"""
    print("\n💵 Testing wallet top-up...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "amount": 50.0,
        "payment_method": "Mobile Money",
        "reference": "TEST-123"
    }
    
    response = requests.post(f"{BASE_URL}/wallet/topup", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Top-up successful!")
        print(f"   Amount: GHS {result['amount']}")
        print(f"   New Balance: GHS {result['balance_after']}")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def test_sms_purchase(token):
    """Test SMS purchase"""
    print("\n📱 Testing SMS purchase...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "units": 100
    }
    
    response = requests.post(f"{BASE_URL}/wallet/purchase-sms", headers=headers, json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ SMS purchase successful!")
        print(f"   Units: {result['sms_units']}")
        print(f"   Cost: GHS {result['amount']}")
        print(f"   New SMS Balance: {result['sms_balance_after']} units")
        return True
    else:
        print(f"❌ Failed: {response.text}")
        return False

def run_all_tests():
    """Run all tests"""
    print("="*60)
    print("🧪 School Fee Management API - Test Suite")
    print("="*60)
    
    # Test health
    if not test_health():
        print("\n❌ Server not responding. Make sure it's running:")
        print("   uvicorn app.main:app --reload")
        return
    
    # Test registration (or skip if user exists)
    token = test_register()
    
    # If registration failed (user exists), try login
    if not token:
        print("\n⚠️  User might already exist, trying login...")
        token = test_login()
    
    if not token:
        print("\n❌ Authentication failed. Cannot continue tests.")
        return
    
    # Test authenticated endpoints
    test_wallet_balance(token)
    test_wallet_topup(token)
    test_sms_purchase(token)
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)
    print("\n📖 Next: Check API docs at http://localhost:8000/docs")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to server!")
        print("Make sure the server is running:")
        print("  cd backend")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {e}")
