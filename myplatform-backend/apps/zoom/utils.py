import time
import base64
import hmac
import hashlib
import json
from django.conf import settings

CLIENT_ID = 'N7IghX4oRlmxBUalSDf9Lw'
CLIENT_SECRET = 'famk0fy3jeass7iwtGo7OrPBjk844VGs'

def generate_signature(meeting_number, role):
    """
    Генерація Zoom JWT підпису для Meeting SDK
    
    Args:
        meeting_number (str): Номер зустрічі Zoom
        role (int): Роль користувача (0 - учасник, 1 - ведучий)
        
    Returns:
        str: Підпис для SDK
    """
    timestamp = int(round(time.time() * 1000)) - 30000
    msg = f"{CLIENT_ID}{meeting_number}{timestamp}{role}"
    
    hmac_obj = hmac.new(
        CLIENT_SECRET.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    )
    
    signature = base64.b64encode(hmac_obj.digest()).decode('utf-8')
    
    return {
        'signature': signature,
        'apiKey': CLIENT_ID,
        'meetingNumber': meeting_number,
        'role': role,
        'timestamp': timestamp
    }

def get_meeting_sdk_data(meeting_number, is_host=False):
    """
    Підготовка даних для Web Meeting SDK
    
    Args:
        meeting_number (str): Номер Zoom зустрічі
        is_host (bool): Чи є користувач ведучим
        
    Returns:
        dict: Дані для ініціалізації Zoom Meeting SDK
    """
    role = 1 if is_host else 0
    signature_data = generate_signature(meeting_number, role)
    
    return signature_data