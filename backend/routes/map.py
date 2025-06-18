from flask import Blueprint, request, jsonify
import os
import requests

map_bp = Blueprint('map', __name__)

@map_bp.route('/wheelchair-route', methods=['POST'])
def get_wheelchair_route():
    data = request.get_json()
    start = data.get('start')
    end = data.get('end')
    
    if not start or not end:
        return jsonify({"error": "Start and end coordinates are required"}), 400
        
    try:
        api_key = os.getenv('ORS_TOKEN')
        if not api_key:
            return jsonify({"error": "OpenRouteService API key not configured"}), 500
            
        url = "https://api.openrouteservice.org/v2/directions/wheelchair/geojson"
        headers = {
            "Content-Type": "application/json",
            "Authorization": api_key
        }
        body = {
            "coordinates": [start, end]
        }
        
        response = requests.post(url, headers=headers, json=body)
        
        if not response.ok:
            return jsonify({
                "error": f"OpenRouteService API error: {response.status_code} {response.text}"
            }), response.status_code
            
        return jsonify(response.json()), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@map_bp.route('/stations', methods=['GET'])
def get_stations():
    try:
        # Check if we need to filter by radius
        lat = request.args.get('lat')
        lng = request.args.get('lng')
        radius = request.args.get('radius', default=1000, type=float)
        
        # If lat/lng provided, search within radius, otherwise return all NYC stations
        if lat and lng:
            query = f"""
                [out:json];
                node
                    ["railway"="station"]
                    ["station"="subway"]
                    (around:{radius}, {lat}, {lng});
                out body;
            """
        else:
            query = """
                [out:json][timeout:25];
                area["name"="New York"]["boundary"="administrative"]->.searchArea;
                node
                    ["railway"="station"]
                    ["station"="subway"]
                    (area.searchArea);
                out body;
            """
        
        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data={'data': query},
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        response.raise_for_status()
        
        data = response.json()
        stations = [
            {
                'id': station['id'],
                'name': station['tags'].get('name', 'Unknown Station'),
                'wheelchair': station['tags'].get('wheelchair', 'unknown'),
                'lat': station['lat'],
                'lon': station['lon']
            }
            for station in data.get('elements', [])
            if 'tags' in station and 'name' in station['tags']
        ]
        
        # If filtering by radius, sort by distance from the given point
        if lat and lng:
            lat, lng = float(lat), float(lng)
            for station in stations:
                # Calculate rough distance (this is a simple approximation)
                dlat = station['lat'] - lat
                dlon = station['lon'] - lng
                station['distance'] = (dlat * dlat + dlon * dlon) ** 0.5
            stations.sort(key=lambda x: x['distance'])
            
        return jsonify(stations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@map_bp.route('/stations/nyc', methods=['GET'])
def get_all_nyc_stations():
    try:
        query = """
            [out:json][timeout:25];
            area["name"="New York"]["boundary"="administrative"]->.searchArea;
            node
                ["railway"="station"]
                ["station"="subway"]
                ["wheelchair"]
                (area.searchArea);
            out body;
        """
        
        response = requests.post(
            'https://overpass-api.de/api/interpreter',
            data={'data': query},
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        response.raise_for_status()
        
        data = response.json()
        stations = [
            {
                'id': station['id'],
                'name': station['tags'].get('name', 'Unknown Station'),
                'wheelchair': station['tags'].get('wheelchair', 'unknown'),
                'lat': station['lat'],
                'lon': station['lon']
            }
            for station in data.get('elements', [])
            if 'tags' in station and 'name' in station['tags']
        ]
        return jsonify(stations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 