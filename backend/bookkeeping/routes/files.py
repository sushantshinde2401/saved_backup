"""
Bookkeeping routes for file management
"""
from flask import Blueprint, request, jsonify, send_file
import os
from database.db_connection import execute_query

from shared.config import Config
from shared.utils import (
    create_success_response,
    create_error_response,
    format_file_info
)

files_bp = Blueprint('files', __name__)

@files_bp.route('/list-files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    try:
        files_data = {
            "images": [],
            "json": [],
            "pdfs": []
        }
        
        # List images
        if os.path.exists(Config.IMAGES_FOLDER):
            for filename in os.listdir(Config.IMAGES_FOLDER):
                file_path = os.path.join(Config.IMAGES_FOLDER, filename)
                file_info = format_file_info(file_path)
                if file_info:
                    files_data["images"].append(file_info)
        
        # List JSON files
        if os.path.exists(Config.JSON_FOLDER):
            for filename in os.listdir(Config.JSON_FOLDER):
                file_path = os.path.join(Config.JSON_FOLDER, filename)
                file_info = format_file_info(file_path)
                if file_info:
                    files_data["json"].append(file_info)
        
        # List PDFs
        if os.path.exists(Config.PDFS_FOLDER):
            for filename in os.listdir(Config.PDFS_FOLDER):
                file_path = os.path.join(Config.PDFS_FOLDER, filename)
                file_info = format_file_info(file_path)
                if file_info:
                    files_data["pdfs"].append(file_info)
        
        # Calculate totals
        total_files = len(files_data["images"]) + len(files_data["json"]) + len(files_data["pdfs"])
        
        return create_success_response(
            "Files listed successfully",
            data=files_data,
            total_files=total_files,
            breakdown={
                "images": len(files_data["images"]),
                "json": len(files_data["json"]),
                "pdfs": len(files_data["pdfs"])
            }
        )
        
    except Exception as e:
        return create_error_response(f"Failed to list files: {str(e)}", 500)

@files_bp.route('/download-pdf/<filename>', methods=['GET'])
def download_pdf(filename):
    """Download PDF file"""
    try:
        file_path = os.path.join(Config.PDFS_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return create_error_response("File not found", 404)
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return create_error_response(f"Failed to download file: {str(e)}", 500)

@files_bp.route('/download-image/<filename>', methods=['GET'])
def download_image(filename):
    """Download image file from database BLOB storage"""
    try:
        from database.db_connection import execute_query
        import json
        from io import BytesIO

        # First try to find file in database by filename
        result = execute_query("""
            SELECT file_data, file_name, mime_type, file_size
            FROM candidate_uploads
            WHERE file_name = %s AND file_data IS NOT NULL
            ORDER BY upload_time DESC
            LIMIT 1
        """, (filename,))

        if result:
            # File found in database BLOB storage
            file_info = result[0]
            file_obj = BytesIO(file_info['file_data'])

            return send_file(
                file_obj,
                as_attachment=True,
                download_name=file_info['file_name'],
                mimetype=file_info['mime_type'] or 'application/octet-stream'
            )

        # Fallback: try filesystem (for backward compatibility during migration)
        file_path = os.path.join(Config.IMAGES_FOLDER, filename)
        if os.path.exists(file_path):
            # Determine mimetype based on extension
            ext = filename.lower().split('.')[-1]
            mimetype_map = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'bmp': 'image/bmp'
            }
            mimetype = mimetype_map.get(ext, 'application/octet-stream')

            return send_file(
                file_path,
                as_attachment=True,
                download_name=filename,
                mimetype=mimetype
            )

        return create_error_response("File not found in database or filesystem", 404)

    except Exception as e:
        return create_error_response(f"Failed to download image: {str(e)}", 500)

@files_bp.route('/file-info/<file_type>/<filename>', methods=['GET'])
def get_file_info(file_type, filename):
    """Get detailed information about a specific file"""
    try:
        # Determine folder based on file type
        folder_map = {
            'image': Config.IMAGES_FOLDER,
            'json': Config.JSON_FOLDER,
            'pdf': Config.PDFS_FOLDER
        }
        
        if file_type not in folder_map:
            return create_error_response("Invalid file type", 400)
        
        file_path = os.path.join(folder_map[file_type], filename)
        file_info = format_file_info(file_path)
        
        if not file_info:
            return create_error_response("File not found", 404)
        
        return create_success_response(
            "File information retrieved successfully",
            data=file_info
        )
        
    except Exception as e:
        return create_error_response(f"Failed to get file info: {str(e)}", 500)

@files_bp.route('/storage-stats', methods=['GET'])
def get_storage_stats():
    """Get storage statistics"""
    try:
        stats = {
            "folders": {},
            "total_size_mb": 0,
            "total_files": 0
        }

        folders = {
            "images": Config.IMAGES_FOLDER,
            "json": Config.JSON_FOLDER,
            "pdfs": Config.PDFS_FOLDER
        }

        for folder_name, folder_path in folders.items():
            folder_stats = {
                "file_count": 0,
                "size_mb": 0,
                "files": []
            }

            if os.path.exists(folder_path):
                for filename in os.listdir(folder_path):
                    file_path = os.path.join(folder_path, filename)
                    if os.path.isfile(file_path):
                        file_info = format_file_info(file_path)
                        if file_info:
                            folder_stats["files"].append(file_info)
                            folder_stats["file_count"] += 1
                            folder_stats["size_mb"] += file_info["size_mb"]

            stats["folders"][folder_name] = folder_stats
            stats["total_files"] += folder_stats["file_count"]
            stats["total_size_mb"] += folder_stats["size_mb"]

        # Round total size
        stats["total_size_mb"] = round(stats["total_size_mb"], 2)

        return create_success_response(
            "Storage statistics retrieved successfully",
            data=stats
        )

    except Exception as e:
        return create_error_response(f"Failed to get storage stats: {str(e)}", 500)

@files_bp.route('/save-invoice-image', methods=['POST'])
def save_invoice_image():
    """Save invoice PDF image to file storage"""
    try:
        import os
        import base64
        from config import Config

        data = request.get_json()

        required_fields = ['invoice_no', 'image_data']
        for field in required_fields:
            if field not in data:
                return create_error_response(f"Missing required field: {field}", 400)

        # Decode base64 image data
        try:
            image_binary = base64.b64decode(data['image_data'])
        except Exception as decode_error:
            return create_error_response(f"Invalid image data: {str(decode_error)}", 400)

        # Get voucher type and determine filename
        voucher_type = data.get('voucher_type', 'Sales')
        voucher_type_to_filename = {
            'Sales': 'SALES_INVOICE.pdf',
            'Receipt': 'RECEIPT.pdf',
            'Adjustment': 'ADJUSTMENT.pdf'
        }
        fixed_filename = voucher_type_to_filename.get(voucher_type, f"{voucher_type}_INVOICE.pdf")

        # Create invoice folder path
        invoice_folder = f"INVOICE_{data['invoice_no']}"
        invoice_dir = os.path.join(Config.INVOICE_STORAGE_PATH, invoice_folder)

        # Ensure invoice directory exists
        os.makedirs(invoice_dir, exist_ok=True)

        # Full file path
        file_path = os.path.join(invoice_dir, fixed_filename)

        # Save file to disk
        try:
            with open(file_path, 'wb') as f:
                f.write(image_binary)
        except Exception as file_error:
            return create_error_response(f"Failed to save file to disk: {str(file_error)}", 500)

        # Relative path for database
        relative_path = f"{invoice_folder}/{fixed_filename}"
        file_size = len(image_binary)

        # Insert/update into invoice_images table (without BLOB data)
        query = """
            INSERT INTO invoice_images (
                invoice_no, file_path, image_type, file_name, file_size, voucher_type
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (invoice_no)
            DO UPDATE SET
                file_path = EXCLUDED.file_path,
                image_type = EXCLUDED.image_type,
                file_name = EXCLUDED.file_name,
                file_size = EXCLUDED.file_size,
                voucher_type = EXCLUDED.voucher_type,
                generated_at = CURRENT_TIMESTAMP
            RETURNING id
        """

        result = execute_query(query, (
            data['invoice_no'],
            relative_path,
            data.get('image_type', 'pdf'),
            fixed_filename,
            file_size,
            voucher_type
        ))

        if result:
            image_id = result[0]['id']
            return create_success_response(
                f"Invoice image saved successfully for invoice: {data['invoice_no']}",
                data={"image_id": image_id, "file_size": file_size, "file_path": relative_path}
            )
        else:
            return create_error_response("Failed to save image", 500)

    except Exception as e:
        return create_error_response(f"Failed to save invoice image: {str(e)}", 500)

@files_bp.route('/get-invoice-image/<path:invoice_no>', methods=['GET'])
def get_invoice_image(invoice_no):
    """Retrieve invoice image by invoice number from file storage"""
    try:
        import os
        import base64
        from config import Config

        query = """
            SELECT id, invoice_no, file_path, image_type, file_name, file_size, generated_at, voucher_type
            FROM invoice_images
            WHERE invoice_no = %s
        """

        results = execute_query(query, (invoice_no,))

        if results and len(results) > 0:
            image_record = results[0]
            file_path = image_record['file_path']

            if not file_path:
                return create_error_response(
                    f"No file path found for invoice number: {invoice_no}",
                    404
                )

            # Build full file path
            full_file_path = os.path.join(Config.INVOICE_STORAGE_PATH, file_path)

            if not os.path.exists(full_file_path):
                return create_error_response(
                    f"Invoice file not found on disk for invoice number: {invoice_no}",
                    404
                )

            # Read file from disk
            try:
                with open(full_file_path, 'rb') as f:
                    file_data = f.read()

                # Convert binary data to base64 for JSON response
                image_base64 = base64.b64encode(file_data).decode('utf-8')

                image_data = {
                    'id': image_record['id'],
                    'invoice_no': image_record['invoice_no'],
                    'image_data': image_base64,
                    'image_type': image_record['image_type'],
                    'file_name': image_record['file_name'],
                    'file_size': image_record['file_size'],
                    'generated_at': str(image_record['generated_at']) if image_record['generated_at'] else None,
                    'voucher_type': image_record['voucher_type'],
                    'file_path': file_path
                }

                return create_success_response(
                    f"Retrieved invoice image for invoice: {invoice_no}",
                    data=image_data
                )
            except Exception as file_error:
                return create_error_response(
                    f"Failed to read invoice file: {str(file_error)}",
                    500
                )
        else:
            return create_error_response(
                f"No invoice image found for invoice number: {invoice_no}",
                404
            )

    except Exception as e:
        return create_error_response(f"Failed to retrieve invoice image: {str(e)}", 500)

