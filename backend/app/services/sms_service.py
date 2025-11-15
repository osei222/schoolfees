import httpx
from typing import Dict, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class ArkeselSMSProvider:
    """Arkesel SMS Provider with hardcoded API credentials"""
    
    def __init__(self, sender_id: Optional[str] = None):
        self.api_key = settings.ARKESEL_API_KEY
        self.sender_id = sender_id or settings.ARKESEL_SENDER_ID
        self.api_url = settings.ARKESEL_API_URL
        
        # Fallback configuration
        self.fallback_keys = [
            "TlZMTndiYXZzaXJtWWxkTFJOdVI",  # Primary
            "backup_key_1",  # Add backup keys if available
            "backup_key_2"
        ]
        
        self.fallback_urls = [
            "https://sms.arkesel.com/sms/api",
            "https://sms.arkesel.com/api/v2/sms/send"
        ]
        
        logger.info(f"ArkeselProvider initialized - sender_id={self.sender_id}")
    
    async def send_sms(self, recipient: str, message: str) -> Dict:
        """
        Send SMS via Arkesel API
        
        Args:
            recipient: Phone number (with country code)
            message: SMS message content
            
        Returns:
            Dict with status and response
        """
        # Format phone number (ensure Ghana format)
        if recipient.startswith('0'):
            recipient = '+233' + recipient[1:]
        elif not recipient.startswith('+'):
            recipient = '+233' + recipient
        
        # Prepare request
        params = {
            'action': 'send-sms',
            'api_key': self.api_key,
            'to': recipient,
            'from': self.sender_id,
            'sms': message
        }
        
        # Try primary API call
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.api_url, params=params)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('code') == '0000':  # Success code
                        logger.info(f"SMS sent successfully to {recipient}")
                        return {
                            'success': True,
                            'message': 'SMS sent successfully',
                            'response': result
                        }
                    else:
                        logger.error(f"Arkesel API error: {result}")
                        return {
                            'success': False,
                            'message': result.get('message', 'Failed to send SMS'),
                            'response': result
                        }
                else:
                    logger.error(f"HTTP error {response.status_code}: {response.text}")
                    return {
                        'success': False,
                        'message': f'HTTP {response.status_code} error',
                        'response': response.text
                    }
                    
        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return {
                'success': False,
                'message': str(e),
                'response': None
            }
    
    async def check_balance(self) -> Dict:
        """Check SMS balance from Arkesel"""
        params = {
            'action': 'check-balance',
            'api_key': self.api_key,
            'response': 'json'
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.api_url, params=params)
                
                if response.status_code == 200:
                    return {
                        'success': True,
                        'data': response.json()
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Failed to check balance'
                    }
        except Exception as e:
            logger.error(f"Balance check failed: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }

# Singleton instance
sms_provider = ArkeselSMSProvider()
