# Recipe Hub

Full-stack recipe sharing application with meal planning and shopping list generation.

## Tech Stack
- **Frontend**: React + Redux + React Router
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt

## Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment Variables
- Copy `backend/.env.example` to `backend/.env` and fill in your PostgreSQL credentials
- Copy `frontend/.env.example` to `frontend/.env`

### 3. Create Database
```bash
psql -U postgres
CREATE DATABASE recipe_hub;
\q
```

### 4. Run Development Servers
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure
```
recipe-hub/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/   # Database, environment config
│   │   ├── models/   # Database models
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/   # API routes
│   │   ├── middleware/  # Custom middleware
│   │   └── utils/    # Helper functions
│   └── uploads/      # Recipe images
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/    # Route pages
│   │   ├── redux/    # State management
│   │   ├── services/ # API services
│   │   └── utils/    # Helper functions
│   └── public/       # Static assets
└── .planning/        # GSD workflow artifacts (local only)
```

## Available Scripts
- `npm run install-all` - Install all dependencies (root, backend, frontend)
- `npm run dev` - Run both backend and frontend concurrently
- `npm run backend` - Run only backend server
- `npm run frontend` - Run only frontend app

## Development Workflow
- Each feature is developed iteratively with atomic commits
- Commits are automatically pushed to GitHub for exam traceability
- React explanations provided after each feature implementation

## API Endpoints

### Health Check
- `GET /api/health` - Server health check
- `GET /api/db-test` - Database connection test

## License
ISC
