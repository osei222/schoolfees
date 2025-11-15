from typing import Optional
import requests
from app.config import settings

class PaystackService:
    """
    Paystack Payment Gateway Integration
    Used for SMS purchases and subscription payments
    """
    
    def __init__(self):
        self.api_key = "pk_test_7a592687934d03a5693f3dd55d148c413ea944a8"
        self.secret_key = "sk_test_7a592687934d03a5693f3dd55d148c413ea944a8"  # You'll need to provide this
        self.base_url = "https://api.paystack.co"
        
    def initialize_transaction(
        self,
        email: str,
        amount: float,
        reference: str,
        callback_url: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Initialize a Paystack transaction
        
        Args:
            email: Customer email
            amount: Amount in GHS (will be converted to pesewas)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional transaction data
            
        Returns:
            dict with authorization_url and access_code
        """
        url = f"{self.base_url}/transaction/initialize"
        
        # Convert GHS to pesewas (smallest unit)
        amount_in_pesewas = int(amount * 100)
        
        payload = {
            "email": email,
            "amount": amount_in_pesewas,
            "reference": reference,
            "currency": "GHS",
            "callback_url": callback_url or f"{settings.FRONTEND_URL}/wallet/verify",
            "metadata": metadata or {}
        }
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "authorization_url": data["data"]["authorization_url"],
                    "access_code": data["data"]["access_code"],
                    "reference": data["data"]["reference"]
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Transaction initialization failed")
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def verify_transaction(self, reference: str) -> dict:
        """
        Verify a Paystack transaction
        
        Args:
            reference: Transaction reference to verify
            
        Returns:
            dict with transaction status and details
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") and data.get("data"):
                transaction = data["data"]
                
                return {
                    "success": True,
                    "status": transaction["status"],  # success, failed, abandoned
                    "amount": transaction["amount"] / 100,  # Convert pesewas to GHS
                    "reference": transaction["reference"],
                    "paid_at": transaction.get("paid_at"),
                    "channel": transaction.get("channel"),  # card, bank, mobile_money
                    "customer": transaction.get("customer"),
                    "metadata": transaction.get("metadata", {})
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Verification failed")
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_banks(self, country: str = "ghana") -> dict:
        """
        Get list of banks for bank transfer
        
        Args:
            country: Country code (ghana, nigeria, etc.)
            
        Returns:
            dict with list of banks
        """
        url = f"{self.base_url}/bank?country={country}"
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "banks": data["data"]
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Failed to fetch banks")
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_subscription_plan(
        self,
        name: str,
        amount: float,
        interval: str = "monthly"
    ) -> dict:
        """
        Create a subscription plan on Paystack
        
        Args:
            name: Plan name (e.g., "Basic Plan", "Premium Plan")
            amount: Monthly amount in GHS
            interval: Billing interval (monthly, annually)
            
        Returns:
            dict with plan details
        """
        url = f"{self.base_url}/plan"
        
        # Convert GHS to pesewas
        amount_in_pesewas = int(amount * 100)
        
        payload = {
            "name": name,
            "amount": amount_in_pesewas,
            "interval": interval,
            "currency": "GHS"
        }
        
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "plan_code": data["data"]["plan_code"],
                    "plan_id": data["data"]["id"],
                    "name": data["data"]["name"],
                    "amount": data["data"]["amount"] / 100
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Plan creation failed")
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e)
            }

# Create singleton instance
paystack_service = PaystackService()
