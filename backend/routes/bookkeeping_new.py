from flask import Blueprint, request, jsonify
from database.db_connection import execute_query
import logging

logger = logging.getLogger(__name__)

bookkeeping_bp = Blueprint('bookkeeping', __name__)

@bookkeeping_bp.route('/get-all-companies', methods=['GET'])
def get_all_companies():
    """Get all companies for dropdown"""
    try:
        from shared.utils import get_all_company_accounts

        companies = get_all_company_accounts()

        if companies:
            logger.info(f"[COMPANIES] Retrieved {len(companies)} companies")
            return jsonify({
                "status": "success",
                "data": companies,
                "message": f"Retrieved {len(companies)} companies successfully",
                "total": len(companies)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No companies found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[COMPANIES] Failed to retrieve companies: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve companies",
            "status": "error"
        }), 500

@bookkeeping_bp.route('/get-all-vendors', methods=['GET'])
def get_all_vendors():
    """Get all vendors for dropdown"""
    try:
        from shared.utils import get_all_vendors

        vendors = get_all_vendors()

        if vendors:
            logger.info(f"[VENDORS] Retrieved {len(vendors)} vendors")
            return jsonify({
                "status": "success",
                "data": vendors,
                "message": f"Retrieved {len(vendors)} vendors successfully",
                "total": len(vendors)
            }), 200
        else:
            return jsonify({
                "status": "success",
                "data": [],
                "message": "No vendors found",
                "total": 0
            }), 200

    except Exception as e:
        logger.error(f"[VENDORS] Failed to retrieve vendors: {e}")
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve vendors",
            "status": "error"
        }), 500