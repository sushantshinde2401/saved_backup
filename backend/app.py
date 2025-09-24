from flask import Flask
from flask_cors import CORS
from datetime import datetime
from config import Config
from routes import register_blueprints
import os
import sys
import subprocess

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"])

# Register all blueprints
register_blueprints(app)

def check_dependencies():
    """Check if critical dependencies are available"""
    print("🔍 Checking dependencies...")

    try:
        import pytesseract
        print("  ✅ pytesseract")
    except ImportError:
        print("  ❌ pytesseract not found. Run: pip install pytesseract")
        return False

    try:
        import cv2
        print("  ✅ opencv-python")
    except ImportError:
        print("  ❌ opencv-python not found. Run: pip install opencv-python")
        return False

    try:
        import numpy
        print("  ✅ numpy")
    except ImportError:
        print("  ❌ numpy not found. Run: pip install numpy")
        return False

    # Check Tesseract executable
    try:
        subprocess.run(["tesseract", "--version"], check=True, capture_output=True)
        print("  ✅ Tesseract OCR executable")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  ⚠️  Tesseract executable not found in PATH")
        print("     OCR functionality may not work properly")

    return True

def check_directories():
    """Ensure required directories exist"""
    print("\n📁 Checking directories...")

    directories = [
        "uploads",
        "uploads/images",
        "uploads/json",
        "uploads/pdfs"
    ]

    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            print(f"  ✅ Created {directory}")
        else:
            print(f"  ✅ {directory} exists")

def check_config():
    """Check configuration files"""
    print("\n⚙️  Checking configuration...")

    if os.path.exists('.env'):
        print("  ✅ .env file found")
    else:
        print("  ⚠️  .env file not found (using defaults)")

    if os.path.exists('service-account.json'):
        print("  ✅ Google Drive service account configured")
    else:
        print("  ⚠️  Google Drive not configured (will use local storage)")

if __name__ == '__main__':
  print("=" * 60)
  print("🚀 DOCUMENT PROCESSING SERVER STARTING")
  print("=" * 60)

  # Run checks
  if not check_dependencies():
      print("\n❌ Dependency check failed. Please install missing packages.")
      print("💡 Run: python setup.py")
      sys.exit(1)

  check_directories()
  check_config()

  print("\n" + "=" * 60)
  print("✅ All checks passed! Starting server...")
  print("=" * 60)
  print(f"[FOLDER] Upload folder: {Config.UPLOAD_FOLDER}")
  print(f"[IMAGES] Images folder: {Config.IMAGES_FOLDER}")
  print(f"[JSON] JSON folder: {Config.JSON_FOLDER}")
  print(f"[PDFS] PDFs folder: {Config.PDFS_FOLDER}")
  print(f"[TEMP] Temp folder: {Config.TEMP_FOLDER}")
  print(f"[FEATURE FLAGS] OCR enabled: {Config.ENABLE_OCR}")
  print(f"[FEATURE FLAGS] ChatGPT filtering enabled: {Config.ENABLE_CHATGPT_FILTERING}")
  print("=" * 60)
  print("[API] Available endpoints:")
  print("   GET  /                     - Health check")
  print("   POST /upload-images        - Upload multiple images to temp session")
  print("   POST /upload-payment-screenshot - Upload payment screenshot to session")
  print("   POST /candidate/save-candidate-data  - Save candidate data & organize files")
  print("   GET  /candidate/get-candidate-data/<filename> - Get candidate data (legacy)")
  print("   GET  /candidate/get-current-candidate-for-certificate - Get current candidate for certificate")
  print("   GET  /candidate/get-all-candidates - Get all candidates from database")
  print("   GET  /candidate/search-candidates - Search candidates by name, email, or passport")
  print("   POST /cleanup-expired-sessions - Clean up old temp sessions")
  print("   POST /save-pdf             - Save PDF + upload to Drive")
  print("   POST /save-right-pdf       - Save right PDF locally only")
  print("   GET  /download-pdf/<filename> - Download PDF")
  print("   POST /upload               - Legacy PDF upload")
  print("   GET  /list-files           - List all files")
  print("   POST /test-ocr             - Test OCR with single image")
  print("   POST /test-chatgpt-ocr     - Test ChatGPT OCR filtering")
  print("   POST /save-certificate-data - Save certificate data for receipt")
  print("   GET  /get-certificate-selections-for-receipt - Get certificate selections")
  print("   POST /update-certificate-company-data - Update certificate company data")
  print("   DELETE /delete-certificate-selection - Delete certificate selection")
  print("   PUT  /update-certificate-selection - Update certificate selection")
  print("=" * 60)
  print("[SERVER] Server will start on: http://localhost:5000")
  print("=" * 60)

  # Start the Flask application
  try:
      app.run(host='0.0.0.0', port=5000, debug=True)
  except KeyboardInterrupt:
      print("\n\n👋 Server stopped by user")
  except Exception as e:
      print(f"\n❌ Server error: {e}")
      sys.exit(1)
