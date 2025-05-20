# apps/zoom/utils.py - Виправлена версія
import time
import base64
import hmac
import hashlib
import json
import requests
import traceback
from django.conf import settings

# Читаємо Zoom API креди безпосередньо з назв середовища, які ви використовуєте
ACCOUNT_ID = getattr(settings, 'ACCOUNT_ID', 'Ez184rvjSzOPHj0I0d9rrw')
CLIENT_ID = getattr(settings, 'CLIENT_ID', 'Hmq1QRw7SvKaU2xq_HcKrg')
CLIENT_SECRET = getattr(settings, 'CLIENT_SECRET', 'EJGHO2lMwigo435nSDE7jPphw0JX2vct')
SDK_KEY = getattr(settings, 'SDK_KEY', CLIENT_ID)
SDK_SECRET = getattr(settings, 'SDK_SECRET', CLIENT_SECRET)

def get_zoom_access_token():
    """
    Отримує OAuth access token для Zoom API за допомогою Server-to-Server OAuth
    """
    print(f"Getting Zoom access token using Client ID: {CLIENT_ID}")
    print(f"Using Account ID: {ACCOUNT_ID}")
    
    url = "https://zoom.us/oauth/token"
    
    # Створюємо дані для Basic auth
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_auth = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    # Параметри передаємо в query-string, а не в тілі
    params = {
        "grant_type": "account_credentials",
        "account_id": ACCOUNT_ID
    }
    
    try:
        print(f"Sending token request to Zoom API with params: {params}")
        response = requests.post(
            url, 
            headers=headers, 
            params=params,  # Використовуємо params замість data
            timeout=10
        )
        print(f"Zoom token response status: {response.status_code}")
        print(f"Zoom token response body: {response.text}")
        
        if response.status_code != 200:
            print(f"Failed to get token: {response.text}")
            raise Exception(f"Failed to get Zoom access token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in", 3600)
        print(f"Successfully obtained Zoom access token: {access_token[:10]}... (expires in {expires_in} seconds)")
        
        return access_token
    except Exception as e:
        print(f"Exception in get_zoom_access_token: {str(e)}")
        print(traceback.format_exc())
        raise

def create_zoom_meeting(topic, description, start_time, duration, settings=None):
    """
    Create a real Zoom meeting via the Zoom API using Server-to-Server OAuth
    """
    try:
        # Отримуємо токен доступу
        token = get_zoom_access_token()
        
        default_settings = {
            "host_video": True,
            "participant_video": True,
            "join_before_host": False,
            "mute_upon_entry": True,
            "auto_recording": "none",
            "waiting_room": False
        }
        
        if settings:
            default_settings.update(settings)
        
        meeting_data = {
            "topic": topic,
            "type": 2,  # Scheduled meeting
            "start_time": start_time,
            "duration": duration,
            "timezone": "UTC",
            "agenda": description,
            "settings": default_settings
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Створюємо зустріч через API
        print(f"Creating Zoom meeting with data: {meeting_data}")
        print(f"Using Zoom API endpoint: https://api.zoom.us/v2/users/me/meetings")
        
        response = requests.post(
            "https://api.zoom.us/v2/users/me/meetings",
            headers=headers,
            json=meeting_data,
            timeout=15  # Збільшуємо timeout для повільних з'єднань
        )
        
        print(f"Zoom create meeting response status: {response.status_code}")
        print(f"Zoom create meeting response body: {response.text[:1000]}")
        
        if response.status_code not in [200, 201]:
            print(f"Failed to create meeting: {response.text}")
            raise Exception(f"Failed to create Zoom meeting: {response.text}")
        
        zoom_data = response.json()
        print(f"Meeting created successfully: {zoom_data['id']}")
        
        # Зберігаємо всі необхідні дані для зустрічі
        return {
            'id': str(zoom_data['id']),
            'join_url': zoom_data.get('join_url', ''),
            'password': zoom_data.get('password', ''),
            'start_url': zoom_data.get('start_url', ''),
            'topic': zoom_data.get('topic', topic),
            'duration': zoom_data.get('duration', duration),
            'start_time': zoom_data.get('start_time', start_time)
        }
    except Exception as e:
        print(f"ERROR: Exception in create_zoom_meeting: {str(e)}")
        print(traceback.format_exc())
        # Не повертаємо заглушки, а пробрасуємо помилку вище
        raise

def generate_sdk_signature(meeting_number, role):
    """
    Generate Meeting SDK JWT signature for version 2.11.0
    
    Args:
        meeting_number (str): Zoom meeting number (id)
        role (int): Role (0=attendee, 1=host)
        
    Returns:
        dict: SDK data including signature, apiKey, meetingNumber, etc.
    """
    # Make sure meeting_number is a string
    meeting_number = str(meeting_number)
    
    # Zoom SDK v2.11.0 uses different format compared to newer versions
    timestamp = int(round(time.time() * 1000)) - 30000
    msg = f"{SDK_KEY}{meeting_number}{timestamp}{role}"
    
    print(f"Generating signature with: SDK_KEY={SDK_KEY[:5]}..., meeting={meeting_number}, timestamp={timestamp}, role={role}")
    
    # Create HMAC-SHA256 signature
    hmac_obj = hmac.new(
        SDK_SECRET.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    )
    
    signature = base64.b64encode(hmac_obj.digest()).decode('utf-8')
    
    print(f"Generated signature: {signature[:10]}...")
    
    # Return all necessary data for the Zoom Meeting SDK
    return {
        'signature': signature,
        'sdkKey': SDK_KEY,  # In version 2.11.0 it's called apiKey in frontend
        'meetingNumber': meeting_number,
        'role': role,
        'leaveUrl': '/dashboard',  # Default leave URL
        'userName': '',  # Will be filled by the calling function
        'userEmail': '', # Will be filled by the calling function
        'passWord': '',  # Will be filled by the calling function
    }
