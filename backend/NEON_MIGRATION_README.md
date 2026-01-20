# Neon PostgreSQL Migration Guide

This guide explains how to migrate your Flask backend from a local PostgreSQL database to a Neon-hosted PostgreSQL database using SQLAlchemy for production safety.

## Prerequisites

1. **Neon Account**: Create a Neon account at https://console.neon.tech/
2. **Neon Database**: Create a new database in Neon and note down the connection details
3. **Python Dependencies**: Install the updated requirements

## Step 1: Install Dependencies

Update your Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

The key addition is `Flask-SQLAlchemy==3.1.1` for production-safe database operations.

## Step 2: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp .env.neon-example .env
   ```

2. **Update `.env` with your Neon credentials**:
   ```env
   # Replace these with your actual Neon database details
   DB_HOST=your-neon-host.neon.tech
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password

   # SSL is required for Neon - DO NOT CHANGE
   DB_SSL_MODE=require
   ```

   **Get these values from your Neon dashboard:**
   - Go to https://console.neon.tech/
   - Select your project
   - Go to "Connection Details"
   - Copy the host, database name, username, and password

## Step 3: Database Setup

### Option A: Migrate Existing Data (Recommended)

If you have existing data in your local PostgreSQL database:

1. **Export your local database**:
   ```bash
   pg_dump -h localhost -U postgres -d your_local_db > backup.sql
   ```

2. **Import to Neon** (using Neon's connection string):
   ```bash
   psql "postgresql://username:password@host/database?sslmode=require" < backup.sql
   ```

### Option B: Fresh Start

If starting fresh, ensure your tables exist in Neon. You can use your existing SQL migration files:

```bash
# Run your existing migration scripts against Neon
python run_create_candidates_table.py
python run_create_certificate_selections_table.py
# ... etc
```

## Step 4: Update Your Flask Application

### Replace Database Imports

**OLD CODE** (in your routes and app files):
```python
from database.db_connection import execute_query, get_candidate_data
```

**NEW CODE**:
```python
from database import db, init_db, execute_query, get_candidate_by_name, save_candidate
```

### Update App Initialization

**OLD CODE** (in `app.py`):
```python
# No database initialization needed (handled in db_connection.py)
```

**NEW CODE**:
```python
from database import init_db

# Initialize database with Neon PostgreSQL
init_db(app)
```

### Example: Update a Route

**OLD CODE**:
```python
from database.db_connection import get_candidate_data

@app.route('/api/candidates')
def get_candidates():
    candidates = get_candidate_data()
    return jsonify(candidates)
```

**NEW CODE**:
```python
from database import execute_query

@app.route('/api/candidates')
def get_candidates():
    query = """
        SELECT id, candidate_name, candidate_folder, json_data, created_at
        FROM candidates
        ORDER BY created_at DESC
        LIMIT 50
    """
    candidates = execute_query(query)
    return jsonify(candidates)
```

## Step 5: Test the Migration

1. **Test database connection**:
   ```bash
   python -c "
   from database import init_db
   from flask import Flask
   app = Flask(__name__)
   init_db(app)
   print('✅ Database connection successful!')
   "
   ```

2. **Run the example app**:
   ```bash
   python app_neon_example.py
   ```

3. **Test endpoints**:
   - `GET /api/health` - Check database connectivity
   - `GET /api/database/test` - Run comprehensive database tests

## Step 6: Production Deployment

### Environment Variables

Ensure these are set in your production environment:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL_MODE=require` (required for Neon)

### Connection Pooling

The new configuration includes production-safe connection pooling:
- `pool_size=10` - Maximum connections
- `max_overflow=20` - Additional overflow connections
- `pool_recycle=300` - Recycle connections every 5 minutes
- `pool_pre_ping=True` - Verify connections before use

## Files Changed/Created

### New Files:
- `database.py` - SQLAlchemy configuration and models
- `app_neon_example.py` - Example Flask app with Neon integration
- `.env.neon-example` - Environment template
- `NEON_MIGRATION_README.md` - This guide

### Modified Files:
- `requirements.txt` - Added Flask-SQLAlchemy
- `config.py` - Updated SSL mode default to 'require'

### Files to Update in Your App:
- `app.py` - Add `init_db(app)` call
- All route files - Update database imports and queries
- Any files using `database/db_connection.py` - Migrate to new database.py

## Troubleshooting

### Connection Issues
- **SSL Error**: Ensure `DB_SSL_MODE=require` is set
- **Authentication Failed**: Double-check Neon credentials
- **Host Not Found**: Verify the Neon host URL

### Import Errors
- **Module Not Found**: Run `pip install -r requirements.txt`
- **SQLAlchemy Error**: Ensure Flask-SQLAlchemy is installed

### Performance Issues
- **Slow Queries**: Use SQLAlchemy's query optimization
- **Connection Pool Exhausted**: Adjust pool settings in `database.py`

## Rollback Plan

If you need to rollback to the old system:

1. **Switch back to `.env`** with local PostgreSQL settings
2. **Change imports** back to `database.db_connection`
3. **Remove** `init_db(app)` from `app.py`
4. **Remove** Flask-SQLAlchemy from requirements.txt

## Benefits of This Migration

1. **Production Safety**: SQLAlchemy provides robust connection pooling and session management
2. **Neon Compatibility**: Optimized for Neon's serverless PostgreSQL
3. **SSL Security**: Enforced SSL connections for data protection
4. **Scalability**: Better handling of concurrent connections
5. **Maintainability**: Cleaner ORM integration for future development

## Support

If you encounter issues:
1. Check the Flask application logs
2. Verify Neon dashboard for connection metrics
3. Test with the example app (`app_neon_example.py`)
4. Ensure all environment variables are correctly set