import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_path):
    """Enhanced image preprocessing for better OCR results - processes in memory only"""
    try:
        print(f"[PREPROCESS] Processing image in memory: {image_path}")

        # Read image
        img = cv2.imread(image_path)
        if img is None:
            print(f"[ERROR] Could not read image: {image_path}")
            return image_path, None

        print(f"[PREPROCESS] Original image size: {img.shape}")

        # Resize image if too small (OCR works better on larger images)
        height, width = img.shape[:2]
        if width < 1000:
            scale_factor = 1000 / width
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            print(f"[PREPROCESS] Resized to: {img.shape}")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Apply multiple preprocessing techniques

        # 1. Noise reduction
        denoised = cv2.medianBlur(gray, 3)

        # 2. Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)

        # 3. Morphological operations to clean up text
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
        morph = cv2.morphologyEx(enhanced, cv2.MORPH_CLOSE, kernel)

        # 4. Adaptive thresholding for better text separation
        adaptive_thresh = cv2.adaptiveThreshold(
            morph, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # 5. Also create OTSU threshold version
        _, otsu_thresh = cv2.threshold(morph, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Process in memory only - no file saving
        print(f"[PREPROCESS] Image processed in memory (no files saved)")

        # Return the original path and processed image array for OCR
        return image_path, otsu_thresh

    except Exception as e:
        print(f"[ERROR] Error preprocessing image: {e}")
        return image_path, None