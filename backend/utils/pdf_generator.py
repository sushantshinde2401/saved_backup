import os
import uuid
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
from PIL import Image as PILImage
import base64
import logging
import qrcode
from reportlab.lib.colors import HexColor
from PyPDF2 import PdfReader, PdfWriter
from config import Config

logger = logging.getLogger(__name__)

# Verification Template layout coordinates (in points, bottom-left origin)
VERIFICATION_LAYOUT = {
    # Text fields - (x, y) coordinates
    "NAME": (420, 646),
    "PASSPORT": (420, 602),
    "CERTIFICATE_NUM": (420, 559),
    "DATE_ISSUE": (420, 517),
    "DATE_FROM": (377, 473),
    "DATE_TO": (468, 473),
    "DATE_EXPIRY": (420, 430),
    "COURSE_NAME": (420, 386)
}

# Certificate Template layout coordinates (in points, bottom-left origin)
CERTIFICATE_LAYOUT = {
    # Page 1 fields
    "CERTIFICATE_NUM": (484, 770),
    "NAME": (320, 612),
    "PASSPORT": (248, 584),
    "NATIONALITY": (463, 584),
    "DOB": (139, 557),
    "CDC": (312, 557),
    "INDOS": (505, 557),
    "COC": (145, 530),
    "ISSUING_COUNTRY": (380, 530),
    "GRADE": (173, 504),
    "ID_NO": (435, 504),
    "COURSE_NAME": (300, 446),
    "DATE_FROM": (274, 388),
    "DATE_TO": (375, 388),
    "DATE_ISSUE": (167, 321),
    "DATE_EXPIRY": (486, 321),

    # Page 2 fields (second image area)
    "TOPICS_SECOND_IMAGE": (35, 754),

    # Image fields - (x, y, width, height) coordinates
    "PHOTO": (52, 213, 70, 90),
    "SIGNATURE": (145, 210, 100, 40),
    "QR_CODE": (260, 211, 82, 82)
}

class PDFGenerator:
    """PDF Certificate Generator using vector overlay method"""

    @staticmethod
    def _format_date(date_str):
        """Convert date string to dd-mm-yyyy format"""
        if not date_str:
            return date_str
        try:
            # Handle YYYY-MM-DD format
            if len(date_str) == 10 and date_str[4] == '-' and date_str[7] == '-':
                year, month, day = date_str.split('-')
                return f"{day}-{month}-{year}"
            # Already in dd-mm-yyyy format
            elif len(date_str) == 10 and date_str[2] == '-' and date_str[5] == '-':
                return date_str
            else:
                return date_str
        except:
            return date_str

    @staticmethod
    def generate_certificate_pdf(certificate_data, template_type="certificate", output_path=None):
        """Generate PDF certificate/verification by overlaying content on base template"""
        try:
            if not output_path:
                # Generate unique filename
                unique_id = str(uuid.uuid4())[:8]
                certificate_num = certificate_data.get('CERTIFICATE_NUM', 'UNKNOWN')
                doc_type = "VERIFICATION" if template_type == "verification" else "CERTIFICATE"
                output_path = f"backend/uploads/certificates/{doc_type}_{certificate_num}_{unique_id}.pdf"

            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Determine template path
            script_dir = os.path.dirname(__file__)  # backend/utils/
            backend_dir = os.path.dirname(script_dir)  # backend/
            template_path = os.path.join(backend_dir, 'pdf_templates', f'{template_type.title()}Template.pdf')

            logger.info(f"Generating PDF {template_type}: {output_path}")
            logger.info(f"Using template: {template_path}")

            # Create PDF writer
            pdf_writer = PdfWriter()

            # Load template PDF if it exists
            if os.path.exists(template_path):
                logger.info(f"Loading {template_type} PDF template")
                template_reader = PdfReader(template_path)
                num_pages = len(template_reader.pages)
                logger.info(f"Template has {num_pages} pages")

                if num_pages > 0:
                    # Process each page of the template
                    for page_num in range(num_pages):
                        template_page = template_reader.pages[page_num]

                        # Create overlay for this page
                        overlay_buffer = BytesIO()
                        c = canvas.Canvas(overlay_buffer, pagesize=A4)

                        # Overlay content based on page and template type
                        if template_type == "certificate":
                            PDFGenerator._overlay_certificate_page(c, certificate_data, page_num, num_pages)
                        else:
                            # For verification, only overlay on first page
                            if page_num == 0:
                                PDFGenerator._overlay_content(c, certificate_data, template_type)

                        # Save overlay to buffer
                        c.save()
                        overlay_buffer.seek(0)

                        # Load overlay and merge onto template page
                        overlay_reader = PdfReader(overlay_buffer)
                        if len(overlay_reader.pages) > 0:
                            template_page.merge_page(overlay_reader.pages[0])

                        # Add merged page to writer
                        pdf_writer.add_page(template_page)
                else:
                    logger.warning(f"Template PDF has no pages, using default overlay")
                    # Create default overlay
                    overlay_buffer = BytesIO()
                    c = canvas.Canvas(overlay_buffer, pagesize=A4)
                    PDFGenerator._overlay_content(c, certificate_data, template_type)
                    c.save()
                    overlay_buffer.seek(0)

                    overlay_reader = PdfReader(overlay_buffer)
                    pdf_writer.add_page(overlay_reader.pages[0])
            else:
                logger.warning(f"Template not found: {template_path}, using default overlay")
                # Create default overlay
                overlay_buffer = BytesIO()
                c = canvas.Canvas(overlay_buffer, pagesize=A4)
                PDFGenerator._overlay_content(c, certificate_data, template_type)
                c.save()
                overlay_buffer.seek(0)

                overlay_reader = PdfReader(overlay_buffer)
                pdf_writer.add_page(overlay_reader.pages[0])

            # Write final PDF
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)

            logger.info(f"PDF {template_type} generated successfully: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Failed to generate PDF {template_type}: {e}")
            return None


    @staticmethod
    def _overlay_content(c, certificate_data, template_type="certificate"):
        """Overlay dynamic content on the certificate/verification"""
        try:
            # Select appropriate layout
            layout = VERIFICATION_LAYOUT if template_type == "verification" else CERTIFICATE_LAYOUT

            # Set text properties
            c.setFont("Helvetica-Bold", 16)
            c.setFillColor(HexColor('#000000'))

            # Overlay text fields based on template type
            if template_type == "verification":
                PDFGenerator._overlay_verification_content(c, certificate_data, layout)
            else:
                PDFGenerator._overlay_certificate_content(c, certificate_data, layout)

            # Handle images (only for certificate template)
            if template_type == "certificate":
                PDFGenerator._overlay_images(c, certificate_data, layout)

                # Generate and overlay QR code
                PDFGenerator._overlay_qr_code(c, certificate_data, layout)

        except Exception as e:
            logger.error(f"Error overlaying content: {e}")

    @staticmethod
    def _overlay_certificate_page(c, certificate_data, page_num, total_pages):
        """Overlay content on specific certificate page"""
        try:
            layout = CERTIFICATE_LAYOUT

            if page_num == 0:
                # Page 1: Main certificate content
                PDFGenerator._overlay_certificate_content(c, certificate_data, layout)
                PDFGenerator._overlay_images(c, certificate_data, layout)
                PDFGenerator._overlay_qr_code(c, certificate_data, layout)
            elif page_num == 1 and total_pages > 1:
                # Page 2: Topics in second image area
                PDFGenerator._overlay_topics_second_image(c, certificate_data, layout)

        except Exception as e:
            logger.error(f"Error overlaying certificate page {page_num}: {e}")

    @staticmethod
    def _overlay_verification_content(c, certificate_data, layout):
        """Overlay content for verification template"""
        c.setFont("Times-Roman", 12)
        c.setFillColor(HexColor('#000000'))

        # Name
        name = certificate_data.get('NAME', '')
        if name and "NAME" in layout:
            x, y = layout["NAME"]

            # Wrap name at 28 characters, ensuring whole words
            wrapped_lines = PDFGenerator._wrap_text(name, max_chars=28)

            # Determine font size based on number of lines
            num_lines = min(len(wrapped_lines), 3)  # Max 3 lines
            if num_lines <= 2:
                font_size = 12
                line_spacing = 14
            else:
                font_size = 10  # Reduce font size for 3 lines
                line_spacing = 12

            c.setFont("Times-Roman", font_size)

            for i in range(num_lines):
                c.drawCentredString(x, y - (i * line_spacing), wrapped_lines[i])

            c.setFont("Times-Roman", 12)  # Reset font

        # Passport
        passport = certificate_data.get('PASSPORT', '')
        if passport and "PASSPORT" in layout:
            c.drawCentredString(layout["PASSPORT"][0], layout["PASSPORT"][1], passport)

        # Certificate Number
        cert_num = certificate_data.get('CERTIFICATE_NUM', '')
        if cert_num and "CERTIFICATE_NUM" in layout:
            c.drawCentredString(layout["CERTIFICATE_NUM"][0], layout["CERTIFICATE_NUM"][1], cert_num)

        # Dates
        date_issue = PDFGenerator._format_date(certificate_data.get('DATE_ISSUE', ''))
        if date_issue and "DATE_ISSUE" in layout:
            c.drawCentredString(layout["DATE_ISSUE"][0], layout["DATE_ISSUE"][1], date_issue)

        date_from = PDFGenerator._format_date(certificate_data.get('DATE_FROM', ''))
        if date_from and "DATE_FROM" in layout:
            c.drawCentredString(layout["DATE_FROM"][0], layout["DATE_FROM"][1], date_from)

        date_to = PDFGenerator._format_date(certificate_data.get('DATE_TO', ''))
        if date_to and "DATE_TO" in layout:
            c.drawCentredString(layout["DATE_TO"][0], layout["DATE_TO"][1], date_to)

        date_expiry = PDFGenerator._format_date(certificate_data.get('DATE_EXPIRY', ''))
        if date_expiry and "DATE_EXPIRY" in layout:
            c.drawCentredString(layout["DATE_EXPIRY"][0], layout["DATE_EXPIRY"][1], date_expiry)

        # Course Name
        course_name = certificate_data.get('COURSE_NAME', '')
        if course_name and "COURSE_NAME" in layout:
            x, y = layout["COURSE_NAME"]

            # Wrap course name at 28 characters, ensuring whole words
            wrapped_lines = PDFGenerator._wrap_text(course_name, max_chars=28)

            # Determine font size based on number of lines
            num_lines = min(len(wrapped_lines), 5)  # Max 5 lines
            font_size = 12
            line_spacing = 14

            c.setFont("Times-Bold", font_size)

            for i in range(num_lines):
                c.drawCentredString(x, y - (i * line_spacing), wrapped_lines[i])

            c.setFont("Times-Roman", 12)  # Reset font

    @staticmethod
    def _overlay_certificate_content(c, certificate_data, layout):
        """Overlay content for certificate template"""
        c.setFont("Times-Roman", 12)
        c.setFillColor(HexColor('#000000'))

        # Certificate Number (prominent)
        cert_num = certificate_data.get('CERTIFICATE_NUM', '')
        if cert_num and "CERTIFICATE_NUM" in layout:
            c.setFont("Times-Roman", 14)
            c.setFillColor(HexColor('#663300'))
            c.drawCentredString(layout["CERTIFICATE_NUM"][0], layout["CERTIFICATE_NUM"][1], cert_num)
            c.setFillColor(HexColor('#000000'))  # Reset to black

        # Candidate Information
        c.setFont("Times-Roman", 13)

        fields = [
            ("NAME", ""),
            ("PASSPORT", ""),
            ("NATIONALITY", ""),
            ("DOB", ""),
            ("CDC", ""),
            ("INDOS", ""),
            ("COC", ""),
            ("ISSUING_COUNTRY", ""),
            ("GRADE", ""),
            ("ID_NO", ""),
        ]

        for field_key, label in fields:
            value = certificate_data.get(field_key, '')
            if value and field_key in layout:
                # Format DOB as dd-mm-yyyy
                if field_key == "DOB":
                    value = PDFGenerator._format_date(value)
                c.drawCentredString(layout[field_key][0], layout[field_key][1], value)

        # Course Name
        course_name = certificate_data.get('COURSE_NAME', '')
        if course_name and "COURSE_NAME" in layout:
            x, y = layout["COURSE_NAME"]

            # Wrap course name at 40 characters, ensuring whole words
            wrapped_lines = PDFGenerator._wrap_text(course_name, max_chars=40)

            # Determine font size and spacing based on number of lines
            num_lines = min(len(wrapped_lines), 3)  # Max 3 lines
            if num_lines <= 2:
                font_size = 20
                line_spacing = 24
            else:
                font_size = 16  # Reduce font size for 3 lines
                line_spacing = 20

            c.setFont("Times-Bold", font_size)
            c.setFillColor(HexColor('#663300'))

            # Calculate starting y for vertical centering
            if num_lines == 1:
                start_y = y - 20  # Center in 3-line space
            elif num_lines == 2:
                start_y = y - 10  # Center 2 lines in 3-line space
            else:
                start_y = y  # Top align for 3 lines

            for i in range(num_lines):
                c.drawCentredString(x, start_y - (i * line_spacing), wrapped_lines[i])

        # Dates
        c.setFont("Times-Roman", 12)
        c.setFillColor(HexColor('#000000'))  # Ensure dates are black

        date_from = PDFGenerator._format_date(certificate_data.get('DATE_FROM', ''))
        if date_from and "DATE_FROM" in layout:
            c.drawCentredString(layout["DATE_FROM"][0], layout["DATE_FROM"][1], date_from)

        date_to = PDFGenerator._format_date(certificate_data.get('DATE_TO', ''))
        if date_to and "DATE_TO" in layout:
            c.drawCentredString(layout["DATE_TO"][0], layout["DATE_TO"][1], date_to)

        date_issue = PDFGenerator._format_date(certificate_data.get('DATE_ISSUE', ''))
        if date_issue and "DATE_ISSUE" in layout:
            c.drawCentredString(layout["DATE_ISSUE"][0], layout["DATE_ISSUE"][1], date_issue)

        date_expiry = PDFGenerator._format_date(certificate_data.get('DATE_EXPIRY', ''))
        if date_expiry and "DATE_EXPIRY" in layout:
            c.drawCentredString(layout["DATE_EXPIRY"][0], layout["DATE_EXPIRY"][1], date_expiry)

    @staticmethod
    def _overlay_images(c, certificate_data, layout):
        """Overlay images (photo and signature) on the certificate with white background rectangles"""
        try:
            # Set white fill color for background rectangles
            c.setFillColor(HexColor('#FFFFFF'))

            # Photo
            photo_data = certificate_data.get('PHOTO')
            if photo_data and "PHOTO" in layout:
                try:
                    x, y, w, h = layout["PHOTO"]
                    logger.info(f"Overlaying photo at ({x}, {y}) with size {w}x{h}")
                    # Draw white background rectangle
                    c.rect(x, y, w, h, fill=1, stroke=0)
                    # Draw image on top
                    img = PDFGenerator._prepare_image(photo_data, (w, h))
                    if img:
                        c.drawImage(img, x, y, width=w, height=h, mask='auto')
                        logger.info("Photo overlaid successfully with white background")
                    else:
                        logger.warning("Photo preparation failed - no image returned")
                except Exception as e:
                    logger.warning(f"Failed to overlay photo: {e}")

            # Signature
            signature_data = certificate_data.get('SIGNATURE')
            if signature_data and "SIGNATURE" in layout:
                try:
                    x, y, w, h = layout["SIGNATURE"]
                    logger.info(f"Overlaying signature at ({x}, {y}) with size {w}x{h}")
                    # Draw white background rectangle
                    c.rect(x, y, w, h, fill=1, stroke=0)
                    # Draw image on top
                    img = PDFGenerator._prepare_image(signature_data, (w, h))
                    if img:
                        c.drawImage(img, x, y, width=w, height=h, mask='auto')
                        logger.info("Signature overlaid successfully with white background")
                    else:
                        logger.warning("Signature preparation failed - no image returned")
                except Exception as e:
                    logger.warning(f"Failed to overlay signature: {e}")

        except Exception as e:
            logger.error(f"Error overlaying images: {e}")

    @staticmethod
    def _overlay_qr_code(c, certificate_data, layout):
        """Generate and overlay QR code pointing to verification portal"""
        try:
            # QR URL must be provided in certificate_data
            qr_data = certificate_data.get('QR_URL')
            if not qr_data:
                logger.error("QR_URL not provided in certificate_data - QR code generation failed")
                return

            if "QR_CODE" in layout:
                # Generate QR code
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_L,
                    box_size=10,
                    border=4,
                )
                qr.add_data(qr_data)
                qr.make(fit=True)

                # Create QR code image
                qr_img = qr.make_image(fill_color="black", back_color="white")

                # Convert to bytes
                qr_buffer = BytesIO()
                qr_img.save(qr_buffer, format='PNG')
                qr_buffer.seek(0)

                # Overlay QR code
                x, y, w, h = layout["QR_CODE"]
                c.drawImage(ImageReader(qr_buffer), x, y, width=w, height=h, mask='auto')
                logger.info(f"QR code generated and overlaid successfully for certificate {certificate_data.get('CERTIFICATE_NUM', 'UNKNOWN')} with URL: {qr_data}")

        except Exception as e:
            logger.error(f"Error generating QR code: {e}")

    @staticmethod
    def _prepare_image(image_data, target_size):
        """Prepare image for overlaying with white background for transparency"""
        try:
            if not image_data:
                logger.warning("No image data provided")
                return None

            logger.info(f"Preparing image for target size {target_size}")

            # Handle base64 data
            if isinstance(image_data, str):
                if image_data.startswith('data:image/'):
                    logger.info("Stripping data:image/ prefix from base64")
                    image_data = image_data.split(',')[1]
                logger.info(f"Decoding base64 image data, length: {len(image_data)}")
                image_data = base64.b64decode(image_data)

            # Open image
            img = PILImage.open(BytesIO(image_data))
            logger.info(f"Opened image with mode: {img.mode}, size: {img.size}")

            # Create white background canvas
            background = PILImage.new('RGB', target_size, (255, 255, 255))

            # Handle transparency: paste image onto white background
            if img.mode in ('RGBA', 'LA', 'P'):
                logger.info("Image has transparency, processing...")
                # If image has transparency, convert and resize
                if img.mode == 'P':
                    img = img.convert('RGBA')
                # Resize the image to fit within target_size
                img.thumbnail(target_size, PILImage.Resampling.LANCZOS)
                logger.info(f"Resized transparent image to: {img.size}")
                # Center the image on white background
                x = (target_size[0] - img.size[0]) // 2
                y = (target_size[1] - img.size[1]) // 2
                background.paste(img, (x, y), img)  # Use alpha channel as mask
            else:
                logger.info("Image has no transparency, processing...")
                # No transparency, just resize and place
                img = img.convert('RGB')
                img.thumbnail(target_size, PILImage.Resampling.LANCZOS)
                logger.info(f"Resized image to: {img.size}")
                # Center the image on white background
                x = (target_size[0] - img.size[0]) // 2
                y = (target_size[1] - img.size[1]) // 2
                background.paste(img, (x, y))

            # Convert back to bytes
            buffer = BytesIO()
            background.save(buffer, format='PNG')
            buffer.seek(0)
            logger.info("Image prepared successfully")

            return ImageReader(buffer)

        except Exception as e:
            logger.error(f"Error preparing image: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None

    @staticmethod
    def _overlay_topics_second_image(c, certificate_data, layout):
        """Overlay topics in the second image area on page 2, splitting on \n for line breaks"""
        try:
            topics = certificate_data.get('TOPICS', '').replace('\\n', '\n')
            if topics and "TOPICS_SECOND_IMAGE" in layout:
                c.setFont("Times-Roman", 12)
                c.setFillColor(HexColor('#000000'))

                # Starting position for the second image area
                x, y_start = layout["TOPICS_SECOND_IMAGE"]
                line_height = 12  # Fixed line height
                y = y_start

                # Split topics on \n and filter out empty lines
                topic_lines = [line.strip() for line in topics.split('\n') if line.strip()]

                for topic in topic_lines:
                    if y > 50:
                        # Wrap each topic line at 65 characters
                        wrapped_lines = PDFGenerator._wrap_text(topic, max_chars=65)
                        for wrapped_line in wrapped_lines:
                            if y > 50:
                                clean_line = wrapped_line.strip().lstrip('•·•-•*•')
                                c.drawString(x, y, clean_line)
                                y -= line_height

        except Exception as e:
            logger.error(f"Error overlaying topics in second image: {e}")

    @staticmethod
    def _wrap_text(text, max_chars=70):
        """Wrap text into lines based on character limit, ensuring whole words"""
        if not text:
            return []

        words = text.split()
        lines = []
        current_line = ""

        for word in words:
            # Check if adding this word (with space if not first) would exceed limit
            potential_line = current_line + (" " + word if current_line else word)

            if len(potential_line) <= max_chars:
                current_line = potential_line
            else:
                # If current line has content, save it and start new line with this word
                if current_line:
                    lines.append(current_line)
                current_line = word

                # If a single word exceeds max_chars, we still add it (though this shouldn't happen with reasonable limits)
                if len(word) > max_chars:
                    lines.append(current_line)
                    current_line = ""

        # Add any remaining content
        if current_line:
            lines.append(current_line)

        return lines

    @staticmethod
    def generate_verification_and_certificate(certificate_data, base_dir="backend/uploads/certificates"):
        """Generate both verification and certificate PDFs"""
        try:
            # Ensure base_dir is absolute path (same as download route)
            if not os.path.isabs(base_dir):
                script_dir = os.path.dirname(__file__)  # backend/utils/
                backend_dir = os.path.dirname(script_dir)  # backend/
                base_dir = os.path.join(backend_dir, 'uploads', 'certificates')

            # Ensure output directory exists
            os.makedirs(base_dir, exist_ok=True)

            logger.info(f"PDF generation - base_dir: {base_dir}")

            # Generate unique filename
            unique_id = str(uuid.uuid4())[:8]
            certificate_num = certificate_data.get('CERTIFICATE_NUM', 'UNKNOWN')

            # Output paths
            verification_output = os.path.join(base_dir, f'VERIFICATION_{certificate_num}_{unique_id}.pdf')
            certificate_output = os.path.join(base_dir, f'CERTIFICATE_{certificate_num}_{unique_id}.pdf')

            logger.info(f"Verification output: {verification_output}")
            logger.info(f"Certificate output: {certificate_output}")

            # Generate PDFs
            logger.info("Starting PDF generation...")

            # Generate verification document first
            verification_success = PDFGenerator.generate_certificate_pdf(
                certificate_data, template_type="verification", output_path=verification_output
            )
            logger.info(f"Verification PDF generation result: {verification_success}")

            # Generate QR code URL pointing to verification portal (replaces PDF download link)
            qr_url = f"{Config.BASE_URL}/verify?certificate_number={certificate_num}"
            logger.info(f"QR code URL generated: {qr_url}")

            # Prepare certificate data with QR URL
            certificate_data_with_qr = certificate_data.copy()
            if qr_url:
                certificate_data_with_qr['QR_URL'] = qr_url

            # Generate certificate document
            certificate_success = PDFGenerator.generate_certificate_pdf(
                certificate_data_with_qr, template_type="certificate", output_path=certificate_output
            )
            logger.info(f"Certificate PDF generation result: {certificate_success}")

            # Check if files exist
            verification_exists = os.path.exists(verification_output)
            certificate_exists = os.path.exists(certificate_output)
            logger.info(f"Verification file exists: {verification_exists} at {verification_output}")
            logger.info(f"Certificate file exists: {certificate_exists} at {certificate_output}")

            if verification_success and certificate_success and verification_exists and certificate_exists:
                return {
                    'verification_file': f'VERIFICATION_{certificate_num}_{unique_id}.pdf',
                    'certificate_file': f'CERTIFICATE_{certificate_num}_{unique_id}.pdf',
                    'verification_path': verification_output,
                    'certificate_path': certificate_output
                }
            else:
                logger.error("PDF generation failed - files not created successfully")
                return None

        except Exception as e:
            logger.error(f"Failed to generate PDFs: {e}")
            return None