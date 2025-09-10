from flask import Flask
from flask_cors import CORS
from datetime import datetime
from config import Config
from routes import register_blueprints

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"])

# Register all blueprints
register_blueprints(app)

if __name__ == '__main__':
  print("=" * 60)
  print(" DOCUMENT PROCESSING SERVER STARTING")
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
  print("   POST /save-candidate-data  - Save candidate data & organize files")
  print("   GET  /get-candidate-data/<filename> - Get candidate data (legacy)")
  print("   GET  /get-current-candidate-for-certificate - Get current candidate for certificate")
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

  app.run(host='0.0.0.0', port=5000, debug=True)
