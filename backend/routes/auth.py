from flask import Blueprint, request, jsonify
from supabase import Client

auth_bp = Blueprint('auth', __name__)

def get_supabase() -> Client:
    from app import supabase
    return supabase

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        supabase = get_supabase()
        result = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return jsonify(result.dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    try:
        supabase = get_supabase()
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return jsonify(result.dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/signout', methods=['POST'])
def signout():
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
        return jsonify({"message": "Successfully signed out"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/user', methods=['GET'])
def get_user():
    try:
        supabase = get_supabase()
        user = supabase.auth.get_user()
        return jsonify(user.dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401 