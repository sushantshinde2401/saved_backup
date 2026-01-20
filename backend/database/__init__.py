# Database module for data management and reporting
from .db_connection import execute_query

# SQLAlchemy imports
import os
import logging
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize SQLAlchemy
db = SQLAlchemy()

def create_database_url():
    """
    Build database URL from environment variables with SSL enforcement for Neon.

    Returns:
        str: PostgreSQL connection URL
    """
    try:
        # Build connection string with SSL requirement for Neon
        url = f"postgresql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}"

        # Add SSL parameters for Neon (required)
        ssl_params = "sslmode=require"

        # Add connection timeout
        timeout_params = f"connect_timeout={Config.DB_CONNECTION_TIMEOUT}"

        # Combine all parameters
        full_url = f"{url}?{ssl_params}&{timeout_params}"

        logger.info("[DB] Database URL configured successfully")
        return full_url

    except Exception as e:
        logger.error(f"[DB] Failed to build database URL: {e}")
        raise

def init_db(app):
    """
    Initialize database connection for Flask app.

    Args:
        app: Flask application instance

    Raises:
        Exception: If database connection fails
    """
    try:
        # Configure SQLAlchemy for the Flask app
        database_url = create_database_url()
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            # Connection pool settings for production
            'pool_pre_ping': True,  # Verify connections before use
            'pool_recycle': 300,    # Recycle connections after 5 minutes
            'pool_size': 10,        # Maximum pool size
            'max_overflow': 20,     # Maximum overflow connections
            'pool_timeout': 30,     # Connection timeout
        }

        # Initialize SQLAlchemy with the app
        db.init_app(app)

        # Test the connection
        with app.app_context():
            # Create engine to test connection
            engine = create_engine(database_url, **app.config['SQLALCHEMY_ENGINE_OPTIONS'])

            # Test connection
            with engine.connect() as connection:
                from sqlalchemy import text
                connection.execute(text("SELECT 1"))
                logger.info("[DB] ✅ Database connection established successfully")

            # Close the test engine
            engine.dispose()

    except SQLAlchemyError as e:
        logger.error(f"[DB] ❌ Database connection failed: {e}")
        raise Exception(f"Failed to connect to database: {e}")
    except Exception as e:
        logger.error(f"[DB] ❌ Unexpected error during database initialization: {e}")
        raise

def get_session():
    """
    Get a database session for manual operations.

    Returns:
        Session: SQLAlchemy session object
    """
    try:
        return db.session
    except Exception as e:
        logger.error(f"[DB] Failed to get database session: {e}")
        raise

# Example SQLAlchemy model (you can define your models here or in separate files)
class Candidate(db.Model):
    """Example SQLAlchemy model for candidates table"""
    __tablename__ = 'candidates'

    id = db.Column(db.Integer, primary_key=True)
    candidate_name = db.Column(db.String(255), unique=True, nullable=False)
    candidate_folder = db.Column(db.String(255))
    candidate_folder_path = db.Column(db.Text)
    json_data = db.Column(db.JSON)
    session_id = db.Column(db.String(255))
    ocr_data = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f'<Candidate {self.candidate_name}>'

def get_candidate_by_name(candidate_name):
    """
    Example function to get candidate by name.

    Args:
        candidate_name (str): Name of the candidate

    Returns:
        Candidate: Candidate object or None
    """
    try:
        candidate = Candidate.query.filter_by(candidate_name=candidate_name).first()
        logger.info(f"[DB] Retrieved candidate: {candidate_name}")
        return candidate
    except Exception as e:
        logger.error(f"[DB] Failed to retrieve candidate {candidate_name}: {e}")
        raise

def save_candidate(candidate_name, candidate_folder, candidate_folder_path, json_data):
    """
    Example function to save a candidate.

    Args:
        candidate_name (str): Unique name of the candidate
        candidate_folder (str): Name of the candidate folder
        candidate_folder_path (str): Full path to the candidate folder
        json_data (dict): Candidate data

    Returns:
        Candidate: Created or updated candidate object
    """
    try:
        # Check if candidate exists
        candidate = Candidate.query.filter_by(candidate_name=candidate_name).first()

        if candidate:
            # Update existing
            candidate.candidate_folder = candidate_folder
            candidate.candidate_folder_path = candidate_folder_path
            candidate.json_data = json_data
        else:
            # Create new
            candidate = Candidate(
                candidate_name=candidate_name,
                candidate_folder=candidate_folder,
                candidate_folder_path=candidate_folder_path,
                json_data=json_data
            )
            db.session.add(candidate)

        db.session.commit()
        logger.info(f"[DB] ✅ Saved candidate: {candidate_name}")
        return candidate

    except Exception as e:
        db.session.rollback()
        logger.error(f"[DB] ❌ Failed to save candidate {candidate_name}: {e}")
        raise
