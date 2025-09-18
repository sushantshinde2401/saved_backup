from .upload import upload_bp
from .candidate import candidate_bp
from .certificate import certificate_bp
from .misc import misc_bp
from .bookkeeping import bookkeeping_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(upload_bp)
    app.register_blueprint(candidate_bp, url_prefix='/candidate')
    app.register_blueprint(certificate_bp)
    app.register_blueprint(misc_bp)
    app.register_blueprint(bookkeeping_bp)