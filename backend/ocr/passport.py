import pytesseract
import re
from PIL import Image
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ocr.preprocess import preprocess_image
from config import Config
from utils.chatgpt import filter_text_with_chatgpt

def extract_passport_front_data(image_path):
    """Enhanced passport front data extraction with better accuracy"""
    try:
        print(f"[OCR] Processing passport front image: {image_path}")

        # Preprocess image in memory
        original_path, processed_image = preprocess_image(image_path)

        # Try multiple OCR approaches for better accuracy
        print("[OCR] Running enhanced OCR extraction...")

        # OCR configurations optimized for passport text - removed character whitelist for better accuracy
        configs = [
            '--psm 6',  # Uniform block of text
            '--psm 4',  # Single column of text
            '--psm 8',  # Single word
            '--psm 13', # Raw line
            '--psm 3',  # Full page
        ]

        all_texts = []
        for i, config in enumerate(configs):
            try:
                # Use processed image if available, otherwise use original
                if processed_image is not None:
                    # Convert numpy array to PIL Image for OCR
                    pil_image = Image.fromarray(processed_image)
                    text = pytesseract.image_to_string(pil_image, config=config)
                else:
                    text = pytesseract.image_to_string(Image.open(original_path), config=config)
                all_texts.append(text)
                print(f"[OCR] Config {i+1} extracted {len(text)} characters")
            except Exception as e:
                print(f"[OCR] Config {i+1} failed: {e}")
                continue

        # Select best text based on quality indicators, not just length
        best_text = ""
        best_score = 0

        for i, text in enumerate(all_texts):
            if not text.strip():
                continue

            # Score based on passport-specific patterns
            score = 0
            text_upper = text.upper()

            # Higher score for passport-related keywords
            if 'PASSPORT' in text_upper: score += 10
            if 'SURNAME' in text_upper: score += 8
            if 'GIVEN' in text_upper: score += 8
            if 'NATIONALITY' in text_upper: score += 5
            if 'SEX' in text_upper: score += 3
            if 'BIRTH' in text_upper: score += 3

            # Bonus for reasonable length
            if 100 < len(text) < 2000: score += 5

            # Penalty for too much noise (excessive special characters)
            noise_chars = sum(1 for c in text if c in '!@#$%^&*()[]{}|\\')
            score -= min(noise_chars, 10)

            print(f"[OCR] Config {i+1} score: {score}, length: {len(text)}")

            if score > best_score:
                best_score = score
                best_text = text

        # Fallback to longest if no good score found
        if not best_text and all_texts:
            best_text = max(all_texts, key=len)
            print("[OCR] Using longest text as fallback")

        print(f"[OCR] Selected text length: {len(best_text)} characters, score: {best_score}")
        print(f"[OCR] Raw text preview:\n{best_text[:300]}...")

        # Initialize data structure - only essential fields
        passport_data = {
            "Passport No.": "",
            "Surname": "",
            "Given Name(s)": "",
            "Nationality": "",
            "Sex": "",
            "Date of Birth": "",
            "raw_text": best_text
        }

        # Try ChatGPT filtering first
        if Config.ENABLE_CHATGPT_FILTERING:
            print("[CHATGPT] Attempting AI-powered extraction...")
            chatgpt_data = filter_text_with_chatgpt(best_text, "passport_front")

            if chatgpt_data:
                print("[CHATGPT] AI extraction successful")
                # Update passport_data with ChatGPT results
                for key, value in chatgpt_data.items():
                    if value and value.strip():  # Only update if ChatGPT found a value
                        passport_data[key] = value.strip()
                        print(f"[CHATGPT] Extracted {key}: {value.strip()}")
            else:
                print("[CHATGPT] AI extraction failed, using fallback methods")

        # Process all extracted texts for better pattern matching
        combined_text = "\n".join(all_texts)
        text_upper = combined_text.upper()

        # Extract MRZ lines (Machine Readable Zone)
        print("[OCR] Extracting MRZ lines...")
        lines = combined_text.split('\n')
        mrz_lines = []
        for line in lines:
            clean_line = line.strip()
            # MRZ lines: 44 characters, contain < and alphanumeric
            if len(clean_line) >= 40 and '<' in clean_line and any(c.isalnum() for c in clean_line):
                mrz_lines.append(clean_line)

        if len(mrz_lines) >= 2:
            print(f"[OCR] Found MRZ lines: {mrz_lines}")

            # Extract only essential data from MRZ
            try:
                mrz1 = mrz_lines[0]
                mrz2 = mrz_lines[1]

                # MRZ Line 1: P<COUNTRY<SURNAME<<GIVEN_NAMES<<<<<<<<<<<<<<<
                if mrz1.startswith('P<'):
                    # Extract surname and given names from MRZ
                    name_part = mrz1[5:].split('<<')
                    if len(name_part) >= 2:
                        passport_data["Surname"] = name_part[0].replace('<', ' ').strip()
                        passport_data["Given Name(s)"] = name_part[1].replace('<', ' ').strip()

                # MRZ Line 2: PASSPORT_NO<COUNTRY<DOB<SEX<EXPIRY<PERSONAL_NO<CHECK
                if len(mrz2) >= 28:
                    passport_data["Passport No."] = mrz2[:9].replace('<', '').strip()
                    passport_data["Nationality"] = mrz2[10:13]

                    # Date of birth (YYMMDD)
                    dob = mrz2[13:19]
                    if dob.isdigit() and len(dob) == 6:
                        year = "19" + dob[:2] if int(dob[:2]) > 30 else "20" + dob[:2]
                        passport_data["Date of Birth"] = f"{dob[4:6]}/{dob[2:4]}/{year}"

                    # Sex
                    passport_data["Sex"] = mrz2[20]

            except Exception as e:
                print(f"[OCR] MRZ parsing error: {e}")

        # Fallback: Extract from regular text if MRZ parsing failed

        if not passport_data["Passport No."]:
            print("[OCR] Extracting passport number from text...")
            passport_patterns = [
                r'PASSPORT\s*NO[.:\s]*([A-Z0-9]{6,9})',
                r'DOCUMENT\s*NO[.:\s]*([A-Z0-9]{6,9})',
                r'NO[.:\s]*([A-Z0-9]{6,9})',
                r'\b([A-Z]{1,2}[0-9]{6,8})\b',
            ]

            for pattern in passport_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    passport_data["Passport No."] = match.group(1)
                    print(f"[OCR] Found passport number: {passport_data['Passport No.']}")
                    break

        if not passport_data["Surname"]:
            print("[OCR] Extracting surname from text...")
            surname_patterns = [
                r'SURNAME[:\s]*([A-Z\s]+?)(?:\n|GIVEN|FIRST)',
                r'FAMILY\s*NAME[:\s]*([A-Z\s]+?)(?:\n|GIVEN|FIRST)',
                r'LAST\s*NAME[:\s]*([A-Z\s]+?)(?:\n|GIVEN|FIRST)',
            ]

            for pattern in surname_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    passport_data["Surname"] = match.group(1).strip()
                    print(f"[OCR] Found surname: {passport_data['Surname']}")
                    break

        if not passport_data["Given Name(s)"]:
            print("[OCR] Extracting given names from text...")
            given_patterns = [
                r'GIVEN\s*NAMES?[:\s]*([A-Z\s]+?)(?:\n|NATIONALITY|SEX)',
                r'FIRST\s*NAME[:\s]*([A-Z\s]+?)(?:\n|NATIONALITY|SEX)',
            ]

            for pattern in given_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    passport_data["Given Name(s)"] = match.group(1).strip()
                    print(f"[OCR] Found given names: {passport_data['Given Name(s)']}")
                    break

        print(f"[OCR] Final extracted passport data:")
        for key, value in passport_data.items():
            if key != "raw_text" and value:
                print(f"  {key}: {value}")

        # No temporary files to clean up (processing done in memory)
        return passport_data

    except Exception as e:
        print(f"[ERROR] Error extracting passport front data: {e}")
        import traceback
        traceback.print_exc()
        return {
            "Passport No.": "",
            "Surname": "",
            "Given Name(s)": "",
            "Nationality": "",
            "Sex": "",
            "Date of Birth": "",
            "raw_text": "",
            "error": str(e)
        }

def extract_passport_back_data(image_path):
    """Extract only address from passport back page using OCR"""
    try:
        print(f"[OCR] Processing passport back image: {image_path}")

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
        print(f"[OCR] Passport back text length: {len(text)} characters")
        print(f"[OCR] Passport back text preview: {text[:200]}...")

        # Initialize data structure - only address needed
        passport_back_data = {
            "Address": "",
            "raw_text": text
        }

        # Try ChatGPT filtering first
        if Config.ENABLE_CHATGPT_FILTERING:
            print("[CHATGPT] Attempting AI-powered address extraction...")
            chatgpt_data = filter_text_with_chatgpt(text, "passport_back")

            if chatgpt_data and chatgpt_data.get("Address"):
                print("[CHATGPT] AI address extraction successful")
                passport_back_data["Address"] = chatgpt_data["Address"].strip()
                print(f"[CHATGPT] Extracted Address: {passport_back_data['Address']}")
            else:
                print("[CHATGPT] AI address extraction failed, using fallback methods")

        # Extract address information using fallback methods if ChatGPT didn't find it
        if not passport_back_data["Address"]:
            lines = text.split('\n')
            text_upper = text.upper()

        # Look for address patterns
        address_patterns = [
            r'ADDRESS[:\s]*([A-Z0-9\s,.-]+?)(?:\n\n|\nFATHER|\nMOTHER|\nSPOUSE|$)',
            r'PERMANENT\s*ADDRESS[:\s]*([A-Z0-9\s,.-]+?)(?:\n\n|\nFATHER|\nMOTHER|\nSPOUSE|$)',
            r'RESIDENTIAL\s*ADDRESS[:\s]*([A-Z0-9\s,.-]+?)(?:\n\n|\nFATHER|\nMOTHER|\nSPOUSE|$)',
        ]

        for pattern in address_patterns:
            match = re.search(pattern, text_upper, re.DOTALL)
            if match:
                address = match.group(1).strip()
                # Clean up the address
                address = re.sub(r'\s+', ' ', address)  # Replace multiple spaces with single space
                passport_back_data["Address"] = address
                print(f"[OCR] Found address: {address}")
                break

        # If no pattern match, try simple line-by-line search
        if not passport_back_data["Address"]:
            for i, line in enumerate(lines):
                line_upper = line.upper()
                if 'ADDRESS' in line_upper:
                    # Take the next few lines as address
                    address_lines = []
                    for j in range(i+1, min(i+4, len(lines))):
                        if lines[j].strip() and not any(word in lines[j].upper() for word in ['FATHER', 'MOTHER', 'SPOUSE']):
                            address_lines.append(lines[j].strip())
                    if address_lines:
                        passport_back_data["Address"] = ' '.join(address_lines)
                        print(f"[OCR] Found address (line search): {passport_back_data['Address']}")
                    break

        print(f"[OCR] Final passport back data: {passport_back_data}")

        # No temporary files to clean up (processing done in memory)
        return passport_back_data

    except Exception as e:
        print(f"[ERROR] Error extracting passport back data: {e}")
        return {
            "Address": "",
            "raw_text": "",
            "error": str(e)
        }