from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from config import Config
from utils.file_ops import sanitize_folder_name, create_unique_candidate_folder, move_files_to_candidate_folder
from database.db_connection import insert_candidate_upload, get_candidate_data as get_candidate_data_from_db, get_candidate_by_id, search_candidates_by_json_field, save_candidate_with_files

candidate_bp = Blueprint('candidate', __name__)

@candidate_bp.route('/save-candidate-data', methods=['POST'])
def save_candidate_data():
    """Save candidate form data and organize files into candidate folder"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract candidate information for folder naming
        first_name = sanitize_folder_name(data.get('firstName', ''))
        last_name = sanitize_folder_name(data.get('lastName', ''))
        passport_no = sanitize_folder_name(data.get('passport', ''))
        session_id = data.get('session_id', '')

        if not all([first_name, last_name, passport_no]):
            return jsonify({"error": "firstName, lastName, and passport are required for file organization"}), 400

        # Create candidate folder name
        candidate_folder_name = f"{first_name}_{last_name}_{passport_no}"

        # Create unique candidate folder in images directory
        candidate_folder_path, final_folder_name = create_unique_candidate_folder(
            Config.IMAGES_FOLDER,
            candidate_folder_name
        )

        # Move files from temp session folder to candidate folder
        moved_files = []
        if session_id:
            temp_session_folder = f"{Config.TEMP_FOLDER}/{session_id}"
            moved_files, move_errors = move_files_to_candidate_folder(
                temp_session_folder,
                candidate_folder_path
            )

            if move_errors:
                print(f"[WARNING] File move errors: {move_errors}")

        # Add metadata to candidate data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        data.update({
            'timestamp': timestamp,
            'last_updated': datetime.now().isoformat(),
            'candidate_folder': final_folder_name,
            'candidate_folder_path': candidate_folder_path,
            'moved_files': moved_files,
            'session_id': session_id
        })

        # Insert candidate data into both PostgreSQL tables
        db_insert_success = False
        db_result = None
        try:
            # Use the new dual insertion function
            db_result = save_candidate_with_files(
                candidate_name=candidate_folder_name,
                candidate_folder=final_folder_name,
                candidate_folder_path=candidate_folder_path,
                json_data=data,
                moved_files=moved_files
            )

            db_insert_success = db_result["success"]
            candidate_id = db_result["candidate_id"]
            upload_ids = db_result["upload_ids"]

            print(f"[DB] ✅ Successfully inserted candidate record (ID: {candidate_id}) and {len(upload_ids)} file records into database")
            print(f"[DB] Upload record IDs: {upload_ids}")

        except Exception as db_error:
            print(f"[DB] ❌ Failed to insert into database: {db_error}")
            print("[DB] Continuing with file operations - database can be synced later")
            # Don't fail the entire operation if DB insert fails
            # This ensures backward compatibility

        # Save current candidate data for certificate generation
        current_candidate_filename = "current_candidate_for_certificate.json"
        current_candidate_path = f"{Config.JSON_FOLDER}/{current_candidate_filename}"

        try:
            # Ensure JSON folder exists
            os.makedirs(Config.JSON_FOLDER, exist_ok=True)

            # Debug: Print the data being saved
            print(f"[DEBUG] Saving candidate data to {current_candidate_path}")
            print(f"[DEBUG] Data keys: {list(data.keys())}")
            print(f"[DEBUG] Candidate: {data.get('firstName')} {data.get('lastName')} - {data.get('passport')}")

            with open(current_candidate_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            # Verify the file was written
            if os.path.exists(current_candidate_path):
                file_size = os.path.getsize(current_candidate_path)
                print(f"[JSON] ✅ Successfully updated {current_candidate_filename} ({file_size} bytes)")
                print(f"[JSON] ✅ Candidate: {data.get('firstName')} {data.get('lastName')} - {data.get('passport')}")
            else:
                raise Exception("File was not created after write operation")

        except Exception as save_error:
            print(f"[ERROR] ❌ Failed to save current candidate for certificate: {save_error}")
            print(f"[ERROR] ❌ Attempted path: {current_candidate_path}")
            print(f"[ERROR] ❌ JSON folder exists: {os.path.exists(Config.JSON_FOLDER)}")
            # This is critical for certificate generation, so we should return an error
            return jsonify({
                "error": f"Failed to save candidate data for certificate generation: {save_error}",
                "status": "partial_failure"
            }), 500

        print(f"[SUCCESS] Candidate data saved successfully")
        print(f"[SUCCESS] Files organized in folder: {final_folder_name}")
        print(f"[SUCCESS] Moved {len(moved_files)} files to candidate folder")

        # Prepare response data
        response_data = {
            "status": "success",
            "message": "Candidate data saved and files organized successfully",
            "filename": current_candidate_filename,
            "candidate_folder": final_folder_name,
            "moved_files": moved_files,
            "files_count": len(moved_files),
            "database_inserted": db_insert_success,
            "database_records": len(moved_files) if db_insert_success else 0
        }

        # Add detailed database information if successful
        if db_insert_success and db_result:
            response_data.update({
                "candidate_id": db_result["candidate_id"],
                "upload_ids": db_result["upload_ids"],
                "database_tables": ["candidates", "candidate_uploads"]
            })

        return jsonify(response_data), 200

    except Exception as e:
        print(f"[ERROR] Save candidate data failed: {e}")
        return jsonify({"error": str(e)}), 500

@candidate_bp.route('/get-candidate-data/<filename>', methods=['GET'])
def get_candidate_data(filename):
    """Retrieve candidate data by filename"""
    try:
        json_path = f"{Config.JSON_FOLDER}/{filename}"

        if not os.path.exists(json_path):
            return jsonify({"error": "File not found"}), 404

        with open(json_path, 'r') as json_file:
            data = json.load(json_file)

        return jsonify({
            "status": "success",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@candidate_bp.route('/get-all-candidates', methods=['GET'])
def get_all_candidates():
    """Get all candidates from database with their file information"""
    try:
        # Get all candidates from database using direct query
        from database.db_connection import execute_query
        query = "SELECT * FROM candidates ORDER BY created_at DESC LIMIT 1000"
        candidates = execute_query(query)

        if not candidates:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No candidates found in database",
                "total": 0
            }), 200

        # Group by candidate_name to show unique candidates with their files
        candidate_groups = {}
        for record in candidates:
            candidate_name = record['candidate_name']
            if candidate_name not in candidate_groups:
                candidate_groups[candidate_name] = {
                    'candidate_name': candidate_name,
                    'files': [],
                    'candidate_data': record['json_data'],
                    'upload_time': record['upload_time'].isoformat() if record['upload_time'] else None
                }
            candidate_groups[candidate_name]['files'].append({
                'id': record['id'],
                'file_name': record['file_name'],
                'file_type': record['file_type'],
                'file_path': record['file_path'],
                'upload_time': record['upload_time'].isoformat() if record['upload_time'] else None
            })

        # Convert to list
        result = list(candidate_groups.values())

        return jsonify({
            "status": "success",
            "data": result,
            "message": f"Retrieved {len(result)} candidates from database",
            "total": len(result)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get all candidates: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve candidates from database",
            "status": "error"
        }), 500

@candidate_bp.route('/search-candidates', methods=['GET'])
def search_candidates():
    """Search candidates by name, email, or passport"""
    try:
        search_term = request.args.get('q', '').strip()
        search_field = request.args.get('field', 'firstName')  # firstName, lastName, email, passport

        if not search_term:
            return jsonify({
                "status": "error",
                "message": "Search term is required"
            }), 400

        # Search in database using direct query
        from database.db_connection import execute_query
        query = f"""
            SELECT * FROM candidates
            WHERE json_data->>'{search_field}' ILIKE %s
            ORDER BY created_at DESC
            LIMIT 50
        """
        results = execute_query(query, (f"%{search_term}%",))

        return jsonify({
            "status": "success",
            "data": results,
            "message": f"Found {len(results)} candidates matching '{search_term}' in {search_field}",
            "search_term": search_term,
            "search_field": search_field
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to search candidates: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to search candidates",
            "status": "error"
        }), 500

@candidate_bp.route('/get-current-candidate-for-certificate', methods=['GET'])
def get_current_candidate_for_certificate():
    """STEP 2: Get current candidate data for certificate generation - returns most recent data"""
    try:
        from datetime import datetime

        # Get data from database
        db_data = None
        db_timestamp = None
        try:
            recent_candidates = get_candidate_data_from_db(limit=1)
            if recent_candidates:
                db_data = recent_candidates[0]['json_data']
                db_timestamp = recent_candidates[0]['created_at']
                print(f"[DB] Retrieved candidate data from database: {db_data.get('firstName')} {db_data.get('lastName')} (timestamp: {db_timestamp})")
        except Exception as db_error:
            print(f"[DB] Failed to retrieve from database: {db_error}")

        # Get data from JSON file
        json_data = None
        json_timestamp = None
        json_path = f"{Config.JSON_FOLDER}/current_candidate_for_certificate.json"

        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as json_file:
                    json_data = json.load(json_file)
                json_timestamp_str = json_data.get('last_updated')
                if json_timestamp_str:
                    try:
                        json_timestamp = datetime.fromisoformat(json_timestamp_str.replace('Z', '+00:00'))
                    except:
                        json_timestamp = datetime.fromisoformat(json_timestamp_str)
                print(f"[JSON] Retrieved candidate data from JSON file: {json_data.get('firstName')} {json_data.get('lastName')} (timestamp: {json_timestamp})")
            except json.JSONDecodeError as json_error:
                print(f"[ERROR] Invalid JSON in current candidate file: {json_error}")
            except Exception as json_error:
                print(f"[ERROR] Failed to read JSON file: {json_error}")

        # Determine which data source is more recent
        selected_data = None
        selected_source = None

        if db_data and json_data:
            # Both sources have data, compare timestamps
            if db_timestamp and json_timestamp:
                if json_timestamp > db_timestamp:
                    selected_data = json_data
                    selected_source = "json_file"
                    print(f"[SYNC] JSON file is more recent ({json_timestamp} > {db_timestamp})")
                else:
                    selected_data = db_data
                    selected_source = "database"
                    print(f"[SYNC] Database is more recent ({db_timestamp} >= {json_timestamp})")
            elif json_timestamp:
                selected_data = json_data
                selected_source = "json_file"
                print("[SYNC] Using JSON file (no database timestamp)")
            else:
                selected_data = db_data
                selected_source = "database"
                print("[SYNC] Using database (no JSON timestamp)")
        elif json_data:
            selected_data = json_data
            selected_source = "json_file"
            print("[SYNC] Using JSON file (database unavailable)")
        elif db_data:
            selected_data = db_data
            selected_source = "database"
            print("[SYNC] Using database (JSON file unavailable)")
        else:
            # No data available from either source
            print("[WARNING] No current candidate data found in database or JSON file")
            return jsonify({
                "error": "No current candidate data found",
                "message": "Please complete the candidate details form first",
                "status": "not_found"
            }), 404

        # Validate that the selected data contains required fields
        required_fields = ['firstName', 'lastName', 'passport']
        missing_fields = [field for field in required_fields if not selected_data.get(field)]

        if missing_fields:
            print(f"[WARNING] Current candidate data missing required fields: {missing_fields}")
            return jsonify({
                "error": f"Incomplete candidate data - missing: {', '.join(missing_fields)}",
                "message": "Please complete the candidate details form with all required information",
                "status": "incomplete",
                "missing_fields": missing_fields
            }), 400

        print(f"[SUCCESS] Returning most recent candidate data: {selected_data.get('firstName')} {selected_data.get('lastName')} from {selected_source}")
        return jsonify({
            "status": "success",
            "data": selected_data,
            "message": "Current candidate data retrieved successfully",
            "source": selected_source
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to get current candidate for certificate: {e}")
        return jsonify({
            "error": str(e),
            "message": "Internal server error while retrieving candidate data",
            "status": "server_error"
        }), 500