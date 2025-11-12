# StepFree: Wheelchair Access and Travel
---
## About StepFree
Only 32% of subway stations in New York City are accessible by wheelchair, leaving millions of riders stranded. Two of our team members have family in NYC and have seen firsthand how inaccessible the city can be for those with mobility challenges. This reality inspired us to build a service that does not yet exist anywhere on the internet—until now.

StepFree is a web app that helps mobility-impaired individuals confidently navigate NYC’s complex transit system. It identifies fully, partially, or non-accessible subway stations, then generates real-time routes that avoid inaccessible stations. No more guesswork or hours spent researching—StepFree takes care of it all in one place.

---

## Project Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── README.md           # Setup instructions
└── routes/             # Route handlers
    ├── __init__.py     # Package initialization
    ├── auth.py         # Authentication endpoints
    ├── routes.py       # Route tracking endpoints
    ├── map.py          # Map-related endpoints
    └── transit.py      # Transit route endpoints
```

---

## 🧩 Setup (Backend)

1. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Create a `.env` file** in the `backend/` directory. (provided through Discord)

4. **Run the development server**
   ```bash
   python app.py
   ```

   The server will start at **http://127.0.0.1:5000**

   

### ☑️ Want to validate that the backend is working?

If this is your first time setting up StepFree, you can quickly test that your backend is running and connected properly.

1. In a **new terminal**, run this command to test the `/health` endpoint:
   ```bash
   curl -i http://127.0.0.1:5000/health
   ```

2. You should see a response like this:
   ```bash
   HTTP/1.1 200 OK
   Content-Type: application/json
   {
     "status": "healthy",
     "message": "Flask backend is running",
     "database": "connected"
   }
   ```

✅ If you see this output, your backend is working as expected!  
If you get an error instead, double-check that:
- You’re in the `backend/` directory  
- Your `.env` file exists and has valid `SUPABASE_URL`, `SUPABASE_KEY`, and `FLASK_ENV` values  
- You started the server with your virtual environment activated  


---

## ⚙️ Setup (Frontend)

The StepFree frontend is a **Next.js 15** application that interfaces with this backend and renders an interactive Mapbox map.

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create a `.env.local` file** in the `frontend/` directory. (provided through Discord)
   

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The frontend will start at **http://localhost:3000**

4. **Verify the setup:**
   - Visit **http://localhost:3000**
   - The map should render properly (requires a valid Mapbox token)
   - Selecting two points on the map should fetch a route via your local Flask backend

---

## 🚀 Running StepFree Locally

You’ll need **two terminals** open:

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open your browser to **http://localhost:3000**.

---

## 🏗️ Project Architecture

### Overview
The project follows a modern **client-server architecture**:

```
StepFree/
├── frontend/           # Next.js Frontend Application
└── backend/            # Flask Backend Server
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/            # Next.js App Router Pages
│   ├── components/     # React Components
│   │   ├── ui/         # Reusable UI Components
│   │   └── homepage/   # Homepage-specific Components
│   └── lib/            # Utility Functions & Helpers
├── public/             # Static Assets
└── package.json        # Dependencies & Scripts
```

**Key Frontend Features**
- Built with **Next.js 15** and **TypeScript**
- Interactive **Mapbox GL JS** map
- Real-time transit route visualization
- Responsive UI with **Tailwind CSS**
- Accessibility-focused design

### Backend (Flask)
```
backend/
├── app.py              # Main Flask Application
├── requirements.txt    # Python dependencies
└── routes/             # Route handlers
    ├── __init__.py
    ├── auth.py         # Authentication endpoints
    ├── routes.py       # Route history endpoints
    ├── map.py          # Map & station endpoints
    └── transit.py      # Transit route endpoints
```

**Key Backend Features**
- RESTful API built with **Flask**
- Authentication via **Supabase**
- Google Maps API for transit routing
- Mapbox + OpenStreetMap integration
- Route history storage and retrieval

---

## 🗄️ Database (Supabase)

| Table | Description |
|--------|-------------|
| **users** | Stores user authentication data and profile info |
| **route_history** | Tracks saved routes, origin/destination, timestamps, and accessibility metadata |

---

## 🔄 Data Flow

**1. Station Data Flow**
```
OpenStreetMap → Backend → Frontend → Map Display
```

**2. Route Planning Flow**
```
User Input → Geocoding → Transit Routing → Accessibility Check → Route Display
```

**3. Route History Flow**
```
User Route → Backend Validation → Supabase Storage → History Display
```

---

## 📡 API Documentation

### Authentication (`/api/auth/`)
- `POST /signup` — Register a new user  
- `POST /signin` — Login user  
- `POST /signout` — Logout user  
- `GET /user` — Get current user info  

### Map & Stations (`/api/map/`)
- `GET /stations` — Fetch all NYC subway stations  
- `GET /stations/nyc` — Fetch NYC stations with accessibility data  

### Routes (`/api/routes/`)
- `POST /history` — Save a new route  
- `GET /history/<user_id>` — Get route history for a user  

### Transit (`/api/transit-route`)
- `GET /transit-route?origin=<lat,lng>&destination=<lat,lng>` — Fetch Google Transit route data  

### System
- `GET /health` — Verify server health  

---

## ✅ Troubleshooting

| Issue | Possible Fix |
|------|---------------|
| **Mapbox “API access token required”** | Ensure `.env.local` is in `frontend/` and named exactly `.env.local` (not `env.local`). Restart `npm run dev`. |
| **“Failed to fetch” when selecting points** | Confirm backend is running and `NEXT_PUBLIC_API_URL` includes `/api`. |
| **Google Maps route not working** | Make sure `GOOGLE_MAPS_API_KEY` is valid and set in `backend/.env`. Restart Flask. |
| **CORS errors** | The backend uses `Flask-CORS`. If still blocked, ensure frontend requests point to `http://127.0.0.1:5000` and backend is running. |
| **Supabase errors** | Ensure both `SUPABASE_URL` and `SUPABASE_KEY` are present in `backend/.env`. |
