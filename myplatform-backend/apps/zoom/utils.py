# apps/zoom/utils.py
import time
import base64
import hmac
import hashlib
import json
import requests
from django.conf import settings

# Zoom API credentials
CLIENT_ID = settings.ZOOM_CLIENT_ID if hasattr(settings, 'ZOOM_CLIENT_ID') else 'N7IghX4oRlmxBUalSDf9Lw'
CLIENT_SECRET = settings.ZOOM_CLIENT_SECRET if hasattr(settings, 'ZOOM_CLIENT_SECRET') else 'famk0fy3jeass7iwtGo7OrPBjk844VGs'
SDK_KEY = settings.ZOOM_SDK_KEY if hasattr(settings, 'ZOOM_SDK_KEY') else 'N7IghX4oRlmxBUalSDf9Lw'
SDK_SECRET = settings.ZOOM_SDK_SECRET if hasattr(settings, 'ZOOM_SDK_SECRET') else 'famk0fy3jeass7iwtGo7OrPBjk844VGs'

def get_zoom_access_token():
    """
    Отримує OAuth access token для Zoom API за допомогою Server-to-Server OAuth
    """
    print(f"Getting Zoom access token using Client ID: {CLIENT_ID}")
    
    url = "https://zoom.us/oauth/token"
    
    # Створюємо дані для запиту
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_auth = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {
        "grant_type": "account_credentials",
        "account_id": "me"  # Для S2S OAuth
    }
    
    try:
        response = requests.post(url, headers=headers, data=data)
        print(f"Zoom token response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to get token: {response.text}")
            raise Exception(f"Failed to get Zoom access token: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        print(f"Successfully obtained Zoom access token: {access_token[:10]}...")
        
        return access_token
    except Exception as e:
        print(f"Exception in get_zoom_access_token: {str(e)}")
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
        
        # Створюємо зустріч за допомогою Me API користувача
        print(f"Creating Zoom meeting with data: {meeting_data}")
        print(f"Using Zoom API endpoint: https://api.zoom.us/v2/users/me/meetings")
        
        response = requests.post(
            "https://api.zoom.us/v2/users/me/meetings",
            headers=headers,
            json=meeting_data
        )
        
        print(f"Zoom create meeting response: {response.status_code} - {response.text[:200]}")
        
        if response.status_code != 201:
            print(f"Failed to create meeting: {response.text}")
            raise Exception(f"Failed to create Zoom meeting: {response.text}")
        
        zoom_data = response.json()
        print(f"Meeting created successfully: {zoom_data['id']}")
        
        return zoom_data
    except Exception as e:
        print(f"Exception in create_zoom_meeting: {str(e)}")
        raise

def generate_sdk_signature(meeting_number, role):
    """
    Generate Meeting SDK JWT signature
    
    Args:
        meeting_number (str): Zoom meeting number (id)
        role (int): Role (0=attendee, 1=host)
        
    Returns:
        dict: SDK data including signature, apiKey, meetingNumber, etc.
    """
    timestamp = int(round(time.time() * 1000)) - 30000
    msg = f"{SDK_KEY}{meeting_number}{timestamp}{role}"
    
    hmac_obj = hmac.new(
        SDK_SECRET.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    )
    
    signature = base64.b64encode(hmac_obj.digest()).decode('utf-8')
    
    return {
        'signature': signature,
        'sdkKey': SDK_KEY,
        'meetingNumber': meeting_number,
        'role': role,
        'timestamp': timestamp
    }