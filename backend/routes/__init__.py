from .upload import upload_bp
from .candidate import candidate_bp
from .certificate import certificate_bp
from .misc import misc_bp
from .bookkeeping import bookkeeping_bp
from .courses import courses_bp
from bookkeeping.routes.files import files_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(upload_bp)
    app.register_blueprint(candidate_bp, url_prefix='/candidate')
    app.register_blueprint(certificate_bp, url_prefix='/certificate')
    app.register_blueprint(misc_bp, url_prefix='/misc')
    app.register_blueprint(courses_bp, url_prefix='/api')
    app.register_blueprint(bookkeeping_bp, url_prefix='/api/bookkeeping')
    app.register_blueprint(files_bp, url_prefix='/api/files')

    # Register certificate status update endpoint directly on app
    # This ensures it has proper CORS handling
    from .bookkeeping import update_certificate_status
    app.add_url_rule('/certificate/update-certificate-status', 'update_certificate_status', update_certificate_status, methods=['POST'])