import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def get_drive_service():
    """Authenticate with Google Drive using a service account"""
    try:
        creds = service_account.Credentials.from_service_account_file(
            Config.SERVICE_ACCOUNT_FILE,
            scopes=Config.SCOPES
        )
        service = build('drive', 'v3', credentials=creds)
        print("[OK] Drive service (Service Account) created successfully")
        return service
    except Exception as e:
        print(f"[ERROR] Failed to create Drive service: {e}")
        raise

def upload_to_drive(file_path, filename):
    """Upload file to Google Drive and return shareable link"""
    if not os.path.exists(Config.SERVICE_ACCOUNT_FILE):
        raise Exception("Service account file not found")

    service = get_drive_service()

    # IMPORTANT: PASTE YOUR SHARED DRIVE ID HERE
    # This is the ID from the URL of your new Shared Drive.
    shared_drive_id = "PASTE_YOUR_SHARED_DRIVE_ID_HERE"

    file_metadata = {
        'name': filename,
        'parents': [shared_drive_id]
    }

    media = MediaFileUpload(file_path, resumable=True)
    uploaded_file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id',
        supportsAllDrives=True
    ).execute()

    file_id = uploaded_file.get('id')

    # Make file shareable
    service.permissions().create(
        fileId=file_id,
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()

    link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    return link