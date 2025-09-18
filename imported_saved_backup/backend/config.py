import os
import pytesseract
from dotenv import load_dotenv
from flask_cors import CORS
from openai import OpenAI

# Define the base directory for the backend
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Load environment variables from .env file in the backend directory
dotenv_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    # Try common installation paths
    possible_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
    ]

    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            print(f"[OK] Tesseract found at: {path}")
            break
    else:
        print("[WARNING] Tesseract not found in common paths. Please install Tesseract OCR.")

# Flask configuration
class Config:
    # Configure upload folders
    UPLOAD_FOLDER = os.path.join(backend_dir, "uploads")
    IMAGES_FOLDER = os.path.join(UPLOAD_FOLDER, "images")
    JSON_FOLDER = os.path.join(UPLOAD_FOLDER, "json")
    PDFS_FOLDER = os.path.join(UPLOAD_FOLDER, "pdfs")
    TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, "temp")

    # File upload settings
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

    # Google Drive config
    SERVICE_ACCOUNT_FILE = os.path.join(backend_dir, os.getenv("GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE", "service-account.json"))
    SCOPES = [os.getenv("GOOGLE_DRIVE_SCOPES", "https://www.googleapis.com/auth/drive.file")]

    # OpenAI config
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1000"))
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.1"))
    ENABLE_CHATGPT_FILTERING = os.getenv("ENABLE_CHATGPT_FILTERING", "true").lower() == "true"

    # Toggle to enable/disable OCR-related endpoints (useful while working on manual entry)
    ENABLE_OCR = os.getenv("ENABLE_OCR", "false").lower() == "true"

    # PostgreSQL Database config
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "candidate_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_SSL_MODE = os.getenv("DB_SSL_MODE", "prefer")
    DB_CONNECTION_TIMEOUT = int(os.getenv("DB_CONNECTION_TIMEOUT", "30"))

# Initialize OpenAI client
def init_openai_client():
    """Initialize OpenAI client with proper error handling"""
    try:
        if Config.OPENAI_API_KEY and Config.OPENAI_API_KEY != "your_openai_api_key_here":
            # Initialize OpenAI client with proper parameters
            client = OpenAI(
                api_key=Config.OPENAI_API_KEY,
                timeout=30.0,
                max_retries=2
            )
            print("[OK] OpenAI client initialized successfully")

            # Test the client with a simple request
            try:
                # Make a test call to verify the API key works
                test_response = client.chat.completions.create(
                    model=Config.OPENAI_MODEL,
                    messages=[{"role": "user", "content": "test"}],
                    max_tokens=5
                )
                print("[OK] OpenAI API key verified and working")
            except Exception as test_error:
                print(f"[WARNING] OpenAI API key test failed: {test_error}")
                client = None
        else:
            client = None
            print("[WARNING] OpenAI API key not configured")
    except Exception as e:
        print(f"[WARNING] OpenAI client initialization failed: {e}")
        print("[INFO] Falling back to regex-based text extraction")
        client = None

    return client

# Global OpenAI client instance
openai_client = init_openai_client()

# Create directories if they don't exist
def create_directories():
    """Create all necessary directories"""
    for folder in [Config.UPLOAD_FOLDER, Config.IMAGES_FOLDER, Config.JSON_FOLDER, Config.PDFS_FOLDER, Config.TEMP_FOLDER]:
        os.makedirs(folder, exist_ok=True)

# Initialize directories on import
create_directories()