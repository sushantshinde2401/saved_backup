import os
import logging
from utils.pdf_generator import PDFGenerator

logger = logging.getLogger(__name__)

class DocumentGenerator:
    """PDF Certificate Generator - Word document generation replaced with PDF"""

    @staticmethod
    def generate_verification_and_certificate(certificate_data, base_dir="backend/uploads/certificates"):
        """Generate PDF certificate using vector overlay method"""
        try:
            logger.info("Generating PDF certificate with vector overlay")

            # Use PDF generator
            result = PDFGenerator.generate_verification_and_certificate(certificate_data, base_dir)

            if result:
                logger.info("PDF certificate generation successful")
                return result
            else:
                logger.error("PDF certificate generation failed")
                return None

        except Exception as e:
            logger.error(f"PDF document generation failed: {e}")
            return None