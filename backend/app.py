from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase environment variables")

# Initialize Supabase client
app.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import and register blueprints
from routes.auth import auth_bp, init_auth_service
from routes.routes import routes_bp
from routes.transit import transit_bp
from routes.map import map_bp

# Initialize auth service with Supabase client
init_auth_service(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(routes_bp, url_prefix='/api/routes')
app.register_blueprint(transit_bp, url_prefix='/api')
app.register_blueprint(map_bp, url_prefix='/api/map')

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Test Supabase connection using REST API
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", headers=headers)
        db_status = "connected" if response.status_code == 200 else "error"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "healthy",
        "message": "Flask backend is running",
        "database": db_status
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000) 