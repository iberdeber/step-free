from flask import Blueprint, request, jsonify
from functools import wraps
import time
from .auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

# Simple rate limiting
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS = 5  # Maximum requests per minute
request_history = {}

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        ip = request.remote_addr
        now = time.time()
        
        # Clean up old entries
        request_history[ip] = [t for t in request_history.get(ip, []) if now - t < RATE_LIMIT_WINDOW]
        
        # Check rate limit
        if len(request_history.get(ip, [])) >= MAX_REQUESTS:
            return jsonify({
                "error": "Too many requests. Please try again later."
            }), 429
            
        # Add current request
        request_history[ip] = request_history.get(ip, []) + [now]
        return f(*args, **kwargs)
    return decorated_function

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("No valid authorization header found")
    return auth_header.split(' ')[1]

def init_auth_service(app):
    """Initialize auth service with Supabase client from app."""
    global auth_service
    auth_service = AuthService(app.supabase)

@auth_bp.route('/signup', methods=['POST'])
@rate_limit
def signup():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
            
        result = auth_service.signup(data['email'], data['password'])
        return jsonify(result), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

@auth_bp.route('/signin', methods=['POST'])
@rate_limit
def signin():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
            
        result = auth_service.signin(data['email'], data['password'])
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

@auth_bp.route('/signout', methods=['POST'])
def signout():
    try:
        token = get_token_from_header()
        result = auth_service.signout(token)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

@auth_bp.route('/user', methods=['GET'])
def get_user():
    try:
        token = get_token_from_header()
        user = auth_service.get_current_user(token)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

@auth_bp.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": "Too many requests. Please try again later."}), 429 