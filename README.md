# StepFree - Accessible Transit Navigation

*This project is a fork from a project I worked on with https://github.com/thomaswolan - which we worked on together alongside https://github.com/pressje04 and https://github.com/qnd303*

StepFree is a web application that helps users find wheelchair-accessible transit routes in New York City. The application integrates multiple data sources and services to provide accurate, accessible navigation.

## Project Architecture

### Overview
The project follows a modern client-server architecture:

```
StepFree/
├── frontend/           # Next.js Frontend Application
└── backend/           # Flask Backend Server
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/          # Next.js App Router Pages
│   ├── components/   # React Components
│   │   ├── ui/      # Reusable UI Components
│   │   └── homepage/ # Homepage-specific Components
│   └── lib/         # Utility Functions & Helpers
├── public/          # Static Assets
└── package.json     # Dependencies & Scripts
```

Key Frontend Features:
- Built with Next.js 13+ and TypeScript
- Interactive map using Mapbox GL JS
- Real-time transit data visualization
- Responsive design with Tailwind CSS
- Client-side state management
- Accessibility-first UI/UX

### Backend (Flask)
```
backend/
├── app.py           # Main Application Entry
├── routes/         # Route Handlers
│   ├── auth.py    # Authentication Routes
│   ├── map.py     # Map & Station Routes
│   ├── routes.py  # Route History
│   └── transit.py # Transit Routes
└── requirements.txt # Python Dependencies
```

Key Backend Features:
- RESTful API built with Flask
- Authentication via Supabase
- Route history storage
- Integration with external APIs
- Error handling & validation

### Database (Supabase)
Tables:
- `users`: User authentication and profiles
- `route_history`: Saved routes and user preferences
  - UUID primary key
  - User references
  - Route data (start/end points, path)
  - Accessibility information
  - Timestamps and metadata

### External Services Integration
1. **OpenStreetMap (Overpass API)**
   - Fetches subway station data
   - Provides wheelchair accessibility information

2. **Mapbox**
   - Map visualization
   - Geocoding services
   - Route display

3. **Google Maps API**
   - Transit routing
   - Real-time transit data

## Data Flow

1. **Station Data Flow**
   ```
   OpenStreetMap → Backend → Frontend → Map Display
   ```

2. **Route Planning Flow**
   ```
   User Input → Geocoding → Transit Routing → Accessibility Check → Route Display
   ```

3. **Route History Flow**
   ```
   User Route → Backend Validation → Supabase Storage → History Display
   ```

## Key Features

1. **Accessibility Information**
   - Real-time station accessibility status
   - Wheelchair-friendly route planning
   - Elevator and facility information

2. **Route Planning**
   - Multi-modal transit routing
   - Accessibility-aware pathfinding
   - Alternative route suggestions

3. **User Features**
   - Route history
   - Favorite routes
   - Customizable preferences

## Development Setup

1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Required Environment Variables:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `NEXT_PUBLIC_API_URL`

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   Required Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `MAPBOX_TOKEN`

## API Documentation

The backend provides several RESTful endpoints:

1. **Authentication**
   - `POST /api/auth/signup`
   - `POST /api/auth/signin`
   - `POST /api/auth/signout`

2. **Map & Stations**
   - `GET /api/map/stations`
   - `GET /api/map/stations/nyc`

3. **Routes**
   - `POST /api/routes/history`
   - `GET /api/routes/history/<user_id>`

4. **Transit**
   - `GET /api/transit-route`