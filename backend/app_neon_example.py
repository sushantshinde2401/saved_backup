"""
Example Flask application showing how to integrate Neon PostgreSQL with SQLAlchemy
This demonstrates the migration from psycopg2 to SQLAlchemy for production safety.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import json
import sys
import os
sys.path.append(os.path.dirname(__file__))

# Import the database.py module directly
import importlib.util
spec = importlib.util.spec_from_file_location("database_module", os.path.join(os.path.dirname(__file__), "database.py"))
db_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(db_module)
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)

    # Initialize database with Neon PostgreSQL
    try:
        db_module.init_db(app)
        logger.info("[APP] ✅ Database initialized successfully with Neon PostgreSQL")
    except Exception as e:
        logger.error(f"[APP] ❌ Database initialization failed: {e}")
        raise

    # Register routes
    register_routes(app)

    return app

def register_routes(app):
    """Register all application routes"""

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint to verify database connection"""
        try:
            # Test database connection
            result = database.execute_query("SELECT 1 as test")
            return jsonify({
                "status": "healthy",
                "database": "connected",
                "neon_ssl": "enabled"
            })
        except Exception as e:
            logger.error(f"[HEALTH] Database health check failed: {e}")
            return jsonify({
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }), 500

    @app.route('/api/candidates/<candidate_name>', methods=['GET'])
    def get_candidate(candidate_name):
        """Get candidate by name using SQLAlchemy model"""
        try:
            candidate = database.get_candidate_by_name(candidate_name)
            if candidate:
                return jsonify({
                    "id": candidate.id,
                    "candidate_name": candidate.candidate_name,
                    "candidate_folder": candidate.candidate_folder,
                    "json_data": candidate.json_data,
                    "created_at": candidate.created_at.isoformat() if candidate.created_at else None
                })
            else:
                return jsonify({"error": "Candidate not found"}), 404
        except Exception as e:
            logger.error(f"[API] Failed to get candidate {candidate_name}: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/candidates', methods=['POST'])
    def create_candidate():
        """Create or update candidate using SQLAlchemy"""
        try:
            data = request.get_json()

            required_fields = ['candidate_name', 'candidate_folder', 'candidate_folder_path', 'json_data']
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            candidate = database.save_candidate(
                candidate_name=data['candidate_name'],
                candidate_folder=data['candidate_folder'],
                candidate_folder_path=data['candidate_folder_path'],
                json_data=data['json_data']
            )

            return jsonify({
                "message": "Candidate saved successfully",
                "candidate_id": candidate.id
            }), 201

        except Exception as e:
            logger.error(f"[API] Failed to save candidate: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/candidates/search/<candidate_name>', methods=['GET'])
    def search_candidates(candidate_name):
        """Search candidates using raw SQL query (legacy compatibility)"""
        try:
            # Using raw SQL for complex queries (like JSON searches)
            query = """
                SELECT id, candidate_name, candidate_folder, json_data, created_at
                FROM candidates
                WHERE candidate_name ILIKE %s
                ORDER BY created_at DESC
                LIMIT 10
            """
            params = (f"%{candidate_name}%",)
            results = database.execute_query(query, params)

            return jsonify({
                "candidates": results,
                "count": len(results)
            })

        except Exception as e:
            logger.error(f"[API] Failed to search candidates: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route('/api/database/test', methods=['GET'])
    def test_database_operations():
        """Test various database operations to ensure Neon compatibility"""
        try:
            tests = {}

            # Test 1: Basic connection
            database.execute_query("SELECT 1")
            tests["connection"] = "✅ PASSED"

            # Test 2: SSL verification (Neon-specific)
            ssl_result = database.execute_query("SHOW ssl")
            ssl_enabled = any(row.get('ssl') == 'on' for row in ssl_result)
            tests["ssl_enabled"] = "✅ PASSED" if ssl_enabled else "❌ FAILED"

            # Test 3: Table existence check
            table_check = database.execute_query("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'candidates'
                )
            """)
            table_exists = table_check[0].get('exists', False)
            tests["candidates_table"] = "✅ EXISTS" if table_exists else "⚠️  NOT FOUND"

            # Test 4: Insert test (with rollback)
            test_insert = database.execute_query("""
                INSERT INTO candidates (candidate_name, candidate_folder, candidate_folder_path, json_data)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, ('TEST_CANDIDATE_NEON', 'test_folder', '/test/path', '{"test": true}'))

            if test_insert:
                # Clean up test data
                database.execute_query("DELETE FROM candidates WHERE candidate_name = %s", ('TEST_CANDIDATE_NEON',))
                tests["insert_rollback"] = "✅ PASSED"
            else:
                tests["insert_rollback"] = "❌ FAILED"

            return jsonify({
                "message": "Database tests completed",
                "neon_postgresql": "configured",
                "tests": tests
            })

        except Exception as e:
            logger.error(f"[TEST] Database test failed: {e}")
            return jsonify({
                "error": str(e),
                "neon_postgresql": "configuration_issue"
            }), 500

# Create the application instance
app = create_app()

if __name__ == '__main__':
    logger.info("[APP] Starting Flask application with Neon PostgreSQL...")
    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "True").lower() == "true"
    )