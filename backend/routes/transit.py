from flask import Blueprint, request, jsonify
import os
import requests

transit_bp = Blueprint('transit', __name__)

@transit_bp.route('/transit-route', methods=['GET'])
def get_transit_route():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    
    if not origin or not destination:
        return jsonify({"error": "Origin and destination are required"}), 400
    
    try:
        api_key = os.getenv('GOOGLE_MAPS_KEY')
        if not api_key:
            return jsonify({"error": "Google Maps API key not configured"}), 500
            
        url = f"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&mode=transit&transit_mode=subway&key={api_key}"
        
        response = requests.get(url)
        data = response.json()
        
        if data.get('status') != 'OK':
            return jsonify({
                "status": data.get('status'),
                "error_message": data.get('error_message', 'Route not found')
            }), 400
            
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500 