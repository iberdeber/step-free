# StepFree Backend

This is the Flask backend for the StepFree application. It handles all API calls and database interactions with Supabase.

## Project Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── README.md          # Setup instructions
└── routes/            # Route handlers
    ├── __init__.py    # Package initialization
    ├── auth.py        # Authentication endpoints
    └── routes.py      # Route tracking endpoints
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r ../requirements.txt
```

3. Create a `.env` file in the backend directory with the following contents:
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
FLASK_ENV=development
```

4. Run the development server:
```bash
python app.py
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /signup` - Register a new user
- `POST /signin` - Login user
- `POST /signout` - Logout user
- `GET /user` - Get current user info

### Route Tracking (`/api/routes/`)
- `POST /history` - Save a new route
- `GET /history/<user_id>` - Get route history for a user

### System
- `GET /health` - Health check endpoint to verify the server is running

More endpoints will be added as they are implemented. 