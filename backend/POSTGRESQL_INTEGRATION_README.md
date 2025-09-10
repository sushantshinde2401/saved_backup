# PostgreSQL Integration for Candidate Uploads System

This document describes the PostgreSQL integration added to the candidate form filling and certificate generation system.

## Overview

The system now stores candidate metadata and JSON form data in PostgreSQL while maintaining the existing file storage on disk. This provides better query performance, data integrity, and scalability.

## Architecture

### File Storage (Unchanged)
- Files remain stored on disk in the existing folder structure
- Location: `backend/uploads/images/{candidate_folder}/`
- No changes to file paths or accessibility

### Database Storage (New)
- Metadata and JSON data stored in PostgreSQL
- Table: `candidate_uploads`
- Provides fast querying and search capabilities

## Database Schema

```sql
CREATE TABLE candidate_uploads (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    json_data JSONB
);
```

### Indexes
- `idx_candidate_uploads_candidate_name` - ON candidate_name
- `idx_candidate_uploads_upload_time` - ON upload_time
- `idx_candidate_uploads_file_type` - ON file_type
- `idx_candidate_uploads_json_data` - GIN index on json_data
- `idx_candidate_uploads_candidate_time` - Composite index on (candidate_name, upload_time)

### View
- `candidate_uploads_view` - Provides easy access to JSON fields as columns

## Setup Instructions

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database User (Optional)
```sql
-- Connect as postgres superuser
CREATE USER candidate_user WITH PASSWORD 'your_password';
CREATE DATABASE candidate_db OWNER candidate_user;
GRANT ALL PRIVILEGES ON DATABASE candidate_db TO candidate_user;
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update PostgreSQL settings:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=candidate_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL_MODE=prefer
DB_CONNECTION_TIMEOUT=30
```

### 4. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 5. Run Database Setup
```bash
cd backend
python setup_database.py
```

This script will:
- Create the database if it doesn't exist
- Execute the SQL script to create tables and indexes
- Test the database connection

## API Changes

### Form Submission (`POST /save-candidate-data`)
- **File Operations**: Unchanged - files still saved to disk
- **Database Operations**: New - metadata inserted into PostgreSQL
- **Response**: Includes `database_inserted` and `database_records` fields

**Response Format:**
```json
{
  "status": "success",
  "message": "Candidate data saved and files organized successfully",
  "candidate_folder": "JOHN_DOE_P123456",
  "moved_files": ["photo.jpg", "passport.pdf"],
  "database_inserted": true,
  "database_records": 2
}
```

### Certificate Generation (`GET /get-current-candidate-for-certificate`)
- **Priority**: Database first, JSON fallback
- **Response**: Includes `source` field indicating data origin

**Response Format:**
```json
{
  "status": "success",
  "data": { ... },
  "source": "database"
}
```

## Error Handling

### Database Connection Failures
- System continues to work with file-based storage
- Database operations are logged but don't break the application
- Graceful fallback ensures backward compatibility

### Database Insert Failures
- File operations complete successfully
- Database errors are logged
- Application returns success for file operations
- Database can be synchronized later

## Migration Strategy

### For Existing Data
1. Files remain in their current locations
2. Run the setup script to create database schema
3. Existing JSON files can be migrated using a separate script (future enhancement)
4. New uploads will automatically populate both file system and database

### Zero Downtime
- Database integration is additive
- Existing functionality remains unchanged
- Fallback mechanisms ensure continuity

## Benefits

### Performance
- Fast queries on candidate data
- Efficient search and filtering
- Reduced memory usage for large datasets

### Scalability
- Database can handle millions of records
- Optimized indexes for common queries
- Connection pooling for high concurrency

### Data Integrity
- ACID transactions
- Foreign key constraints (extensible)
- Data validation at database level

### Analytics
- Rich querying capabilities
- Aggregation and reporting
- Historical data analysis

## Monitoring and Maintenance

### Database Health Checks
```sql
-- Check table size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename = 'candidate_uploads';

-- Check index usage
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'candidate_uploads';
```

### Backup Strategy
```bash
# Database backup
pg_dump candidate_db > candidate_db_backup.sql

# Restore
psql candidate_db < candidate_db_backup.sql
```

### Log Analysis
Database operations are logged with `[DB]` prefix for easy monitoring.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check connection parameters in `.env`
   - Verify firewall settings

2. **Permission Denied**
   - Check database user permissions
   - Ensure user can create databases and tables

3. **Table Already Exists**
   - The SQL script is idempotent
   - Existing tables are preserved

### Debug Mode
Set `FLASK_DEBUG=True` in `.env` for detailed error messages.

## Future Enhancements

### Planned Features
- Data migration script for existing JSON files
- Advanced search and filtering API
- Database-backed certificate selections
- Audit logging for data changes
- Automated backup and recovery

### Performance Optimizations
- Query result caching
- Database read replicas
- Partitioning for large datasets
- Full-text search capabilities

## Support

For issues related to PostgreSQL integration:
1. Check the application logs for `[DB]` prefixed messages
2. Verify database connectivity with `python setup_database.py`
3. Ensure all environment variables are correctly set
4. Review PostgreSQL server logs for connection issues

## Version History

- **v1.0**: Initial PostgreSQL integration
  - Basic CRUD operations
  - File metadata storage
  - JSON data persistence
  - Graceful fallback mechanisms