import qrcode
import base64
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def generate_qr_code(link, filename):
    """Generate QR code for the given link"""
    img = qrcode.make(link)
    qr_path = os.path.join(Config.UPLOAD_FOLDER, f"{filename}_qr.png")
    img.save(qr_path)

    # Convert to base64 for frontend
    with open(qr_path, "rb") as img_file:
        qr_base64 = base64.b64encode(img_file.read()).decode('utf-8')

    return qr_path, qr_base64