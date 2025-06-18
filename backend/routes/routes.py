from flask import Blueprint, request, jsonify
from supabase import Client
from datetime import datetime

routes_bp = Blueprint('routes', __name__)

def get_supabase() -> Client:
    from app import supabase
    return supabase

@routes_bp.route('/history', methods=['POST'])
def insert_route_history():
    data = request.get_json()
    user_id = data.get('userId')
    start_point = data.get('startPoint')
    end_point = data.get('endPoint')
    route_data = data.get('routeData')
    duration = data.get('duration')
    
    if not all([user_id, start_point, end_point, route_data, duration]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        supabase = get_supabase()
        result = supabase.table('route_history').insert({
            "user_id": user_id,
            "start_point": start_point,
            "end_point": end_point,
            "route_data": route_data,
            "duration": duration,
            "completed_at": datetime.utcnow().isoformat()
        }).execute()
        
        return jsonify(result.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@routes_bp.route('/history/<user_id>', methods=['GET'])
def get_route_history(user_id):
    try:
        supabase = get_supabase()
        result = supabase.table('route_history')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('completed_at', desc=True)\
            .execute()
            
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 