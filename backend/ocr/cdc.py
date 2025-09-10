import pytesseract
import re
from PIL import Image
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.preprocess import preprocess_image
from config import Config
from utils.chatgpt import filter_text_with_chatgpt

def extract_cdc_data(image_path):
    """Extract CDC number and INDOS number from CDC image using OCR"""
    try:
        print(f"[OCR] Processing CDC image: {image_path}")

        # Preprocess image in memory
        original_path, processed_image = preprocess_image(image_path)

        # Perform OCR with multiple configurations
        configs = [
            '--psm 6',  # Uniform block of text
            '--psm 4',  # Single column of text
            '--psm 3',  # Fully automatic page segmentation
        ]

        best_text = ""
        for config in configs:
            try:
                # Use processed image if available, otherwise use original
                if processed_image is not None:
                    # Convert numpy array to PIL Image for OCR
                    pil_image = Image.fromarray(processed_image)
                    text = pytesseract.image_to_string(pil_image, config=config)
                else:
                    text = pytesseract.image_to_string(Image.open(original_path), config=config)
                if len(text.strip()) > len(best_text.strip()):
                    best_text = text
            except:
                continue

        text = best_text
        print(f"[OCR] CDC text length: {len(text)} characters")
        print(f"[OCR] CDC text preview: {text[:200]}...")

        # Initialize data structure
        cdc_data = {
            "cdc_no": "",
            "indos_no": "",
            "raw_text": text  # Include raw text for debugging
        }

        # Try ChatGPT filtering first
        if Config.ENABLE_CHATGPT_FILTERING:
            print("[CHATGPT] Attempting AI-powered CDC extraction...")
            chatgpt_data = filter_text_with_chatgpt(text, "cdc")

            if chatgpt_data:
                print("[CHATGPT] AI CDC extraction successful")
                if chatgpt_data.get("cdc_no"):
                    cdc_data["cdc_no"] = chatgpt_data["cdc_no"].strip()
                    print(f"[CHATGPT] Extracted CDC No: {cdc_data['cdc_no']}")
                if chatgpt_data.get("indos_no"):
                    cdc_data["indos_no"] = chatgpt_data["indos_no"].strip()
                    print(f"[CHATGPT] Extracted INDOS No: {cdc_data['indos_no']}")
            else:
                print("[CHATGPT] AI CDC extraction failed, using fallback methods")

        # Extract CDC and INDOS numbers with fallback patterns if ChatGPT didn't find them
        if not cdc_data["cdc_no"] or not cdc_data["indos_no"]:
            text_upper = text.upper()

        # CDC number patterns
        cdc_patterns = [
            r'CDC\s*NO[.:]?\s*([A-Z0-9]{6,})',
            r'CDC[:\s]*([A-Z0-9]{6,})',
            r'CERTIFICATE\s*NO[.:]?\s*([A-Z0-9]{6,})',
        ]

        for pattern in cdc_patterns:
            match = re.search(pattern, text_upper)
            if match:
                cdc_data["cdc_no"] = match.group(1)
                print(f"[OCR] Found CDC number: {cdc_data['cdc_no']}")
                break

        # INDOS number patterns
        indos_patterns = [
            r'INDOS\s*NO[.:]?\s*([A-Z0-9]{6,})',
            r'INDOS[:\s]*([A-Z0-9]{6,})',
            r'IND[:\s]*([A-Z0-9]{6,})',
        ]

        for pattern in indos_patterns:
            match = re.search(pattern, text_upper)
            if match:
                cdc_data["indos_no"] = match.group(1)
                print(f"[OCR] Found INDOS number: {cdc_data['indos_no']}")
                break

        print(f"[OCR] Extracted CDC data: {cdc_data}")

        # No temporary files to clean up (processing done in memory)
        return cdc_data

    except Exception as e:
        print(f"[ERROR] Error extracting CDC data: {e}")
        return {
            "cdc_no": "",
            "indos_no": "",
            "raw_text": "",
            "error": str(e)
        }