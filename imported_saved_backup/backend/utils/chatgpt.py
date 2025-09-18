import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import openai_client, Config

def enhanced_regex_filtering(raw_text, document_type="passport_front"):
    """Enhanced regex-based text filtering as fallback"""
    import re

    print(f"[REGEX] Processing {document_type} with enhanced regex patterns...")

    # Clean common OCR errors
    text = raw_text.upper()

    # Fix common OCR mistakes
    replacements = {
        'PASSF0RT': 'PASSPORT',
        'PASSPCRT': 'PASSPORT',
        'PASSP0RT': 'PASSPORT',
        'N0:': 'NO:',
        'N0.': 'NO.',
        'SURNAM3': 'SURNAME',
        'NAM3': 'NAME',
        'D0B': 'DOB',
        'BIRTH': 'BIRTH',
        '0': '0',  # Ensure zeros are consistent
        'O': '0',  # Convert O to 0 in numbers
    }

    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)

    result = {}

    if document_type == "passport_front":
        # Enhanced passport number patterns - more flexible
        passport_patterns = [
            r'PASSPORT\s*NO[.:\s]*([A-Z0-9]{6,12})',
            r'PASS\w*\s*NO[.:\s]*([A-Z0-9]{6,12})',
            r'NO[.:\s]*([A-Z0-9]{6,12})',
            r'([A-Z]{1,2}[0-9]{6,10})',  # Common passport format
            r'([0-9]{7,9})',  # Pure numeric passport numbers
            r'P\s*([A-Z0-9]{6,11})',  # P prefix format
        ]

        for pattern in passport_patterns:
            match = re.search(pattern, text)
            if match:
                passport_num = match.group(1).strip()
                if len(passport_num) >= 6:  # Minimum length check
                    result["Passport No."] = passport_num
                    print(f"[REGEX] Found passport: {result['Passport No.']}")
                    break

        # Enhanced name patterns - more flexible
        surname_patterns = [
            r'SURNAME[:\s]*([A-Z][A-Z\s]{1,30})(?:\s*\n|\s*GIVEN|\s*NAME|\s*$)',
            r'LAST\s*NAME[:\s]*([A-Z][A-Z\s]{1,30})(?:\s*\n|\s*GIVEN|\s*FIRST|\s*$)',
            r'([A-Z]{2,})\s*,\s*([A-Z\s]+)',  # "SURNAME, GIVEN NAMES" format
        ]

        for pattern in surname_patterns:
            match = re.search(pattern, text)
            if match:
                if len(match.groups()) > 1:  # Comma-separated format
                    result["Surname"] = match.group(1).strip()
                    result["Given Name(s)"] = match.group(2).strip()
                    print(f"[REGEX] Found surname: {result['Surname']}")
                    print(f"[REGEX] Found given name: {result['Given Name(s)']}")
                else:
                    surname = match.group(1).strip()
                    if len(surname) >= 2:  # Minimum length check
                        result["Surname"] = surname
                        print(f"[REGEX] Found surname: {result['Surname']}")
                break

        # Given names patterns - only if not found above
        if not result.get("Given Name(s)"):
            given_patterns = [
                r'GIVEN\s*NAME[S]?[:\s]*([A-Z][A-Z\s]{1,30})(?:\s*\n|\s*NATIONALITY|\s*SEX|\s*$)',
                r'FIRST\s*NAME[:\s]*([A-Z][A-Z\s]{1,30})(?:\s*\n|\s*LAST|\s*SURNAME|\s*$)',
            ]

            for pattern in given_patterns:
                match = re.search(pattern, text)
                if match:
                    given_name = match.group(1).strip()
                    if len(given_name) >= 2:  # Minimum length check
                        result["Given Name(s)"] = given_name
                        print(f"[REGEX] Found given name: {result['Given Name(s)']}")
                        break

        # Additional patterns for nationality, sex, and date of birth
        nationality_patterns = [
            r'NATIONALITY[:\s]*([A-Z]{3})',
            r'NAT[:\s]*([A-Z]{3})',
        ]

        for pattern in nationality_patterns:
            match = re.search(pattern, text)
            if match:
                result["Nationality"] = match.group(1).strip()
                print(f"[REGEX] Found nationality: {result['Nationality']}")
                break

        sex_patterns = [
            r'SEX[:\s]*([MF])',
            r'GENDER[:\s]*([MF])',
        ]

        for pattern in sex_patterns:
            match = re.search(pattern, text)
            if match:
                result["Sex"] = match.group(1).strip()
                print(f"[REGEX] Found sex: {result['Sex']}")
                break

        # Date of birth patterns
        dob_patterns = [
            r'DATE\s*OF\s*BIRTH[:\s]*(\d{2}[/.-]\d{2}[/.-]\d{4})',
            r'DOB[:\s]*(\d{2}[/.-]\d{2}[/.-]\d{4})',
            r'BIRTH[:\s]*(\d{2}[/.-]\d{2}[/.-]\d{4})',
        ]

        for pattern in dob_patterns:
            match = re.search(pattern, text)
            if match:
                result["Date of Birth"] = match.group(1).strip()
                print(f"[REGEX] Found date of birth: {result['Date of Birth']}")
                break

    return result if result else None

def filter_text_with_chatgpt(raw_text, document_type="passport_front"):
    """Use ChatGPT to filter and extract structured data from OCR text"""
    if not openai_client or not Config.OPENAI_API_KEY:
        print("[CHATGPT] API key not configured, using enhanced regex filtering")
        return enhanced_regex_filtering(raw_text, document_type)

    try:
        print(f"[CHATGPT] Processing {document_type} with AI...")

        if document_type == "passport_front":
            prompt = f"""Extract passport information from this OCR text. The text may contain errors and noise.
Please extract only the following fields and return as JSON:
- "Passport No.": passport number
- "Surname": last name/family name
- "Given Name(s)": first/given names
- "Nationality": nationality code (3 letters)
- "Sex": M or F
- "Date of Birth": format DD/MM/YYYY

OCR Text:
{raw_text}

Return only valid JSON with the extracted fields. If a field cannot be found, use empty string."""

        elif document_type == "passport_back":
            prompt = f"""Extract address information from this passport back page OCR text.
Please extract only the Address field and return as JSON:
- "Address": complete address

OCR Text:
{raw_text}

Return only valid JSON. If address cannot be found, use empty string."""

        elif document_type == "cdc":
            prompt = f"""Extract CDC certificate information from this OCR text.
Please extract only the following fields and return as JSON:
- "cdc_no": CDC number/certificate number
- "indos_no": INDOS number

OCR Text:
{raw_text}

Return only valid JSON. If a field cannot be found, use empty string."""

        response = openai_client.chat.completions.create(
            model=Config.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured data from passport and certificate documents. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=Config.OPENAI_MAX_TOKENS,
            temperature=Config.OPENAI_TEMPERATURE
        )

        # Parse the JSON response
        content = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        extracted_data = json.loads(content)
        print(f"[CHATGPT] Successfully extracted data: {extracted_data}")
        return extracted_data

    except Exception as e:
        print(f"[CHATGPT] Error filtering text: {e}")
        print("[CHATGPT] Falling back to enhanced regex filtering")
        return enhanced_regex_filtering(raw_text, document_type)