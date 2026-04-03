# Phase 1: Project Foundation & Environment Setup - Implementation Plan

## Phase Goal
Setup project structure, development environment, and database foundation to enable development of the Recipe Hub full-stack application.

## Success Criteria
- ✅ Frontend React app runs on localhost:3000
- ✅ Backend Express server runs on localhost:5000
- ✅ PostgreSQL database connection successful
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Git repository properly configured with .gitignore

## Prerequisites
- Node.js (v16+) installed
- PostgreSQL (v12+) installed and running
- Git installed
- Text editor (VS Code recommended)

---

## Task Breakdown

### Task 1: Create Project Directory Structure
**Prompt**: Create the foundational directory structure for the Recipe Hub project with separate frontend and backend folders.

**Actions**:
1. Create `backend/` directory for Express server
2. Create `backend/src/` for source code
3. Create `backend/src/config/` for configuration files
4. Create `backend/src/models/` for database models
5. Create `backend/src/controllers/` for route controllers
6. Create `backend/src/routes/` for API routes
7. Create `backend/src/middleware/` for custom middleware
8. Create `backend/src/utils/` for helper functions
9. Create `backend/uploads/` for recipe images
10. Create `frontend/` directory for React app
11. Create `frontend/public/` for static assets
12. Create `frontend/src/` for React source code

**Expected Outcome**: Complete directory structure with backend/ and frontend/ folders and subdirectories.

**Commit Message**: `feat: Create project directory structure with frontend and backend folders`

---

### Task 2: Initialize Backend Package and Install Dependencies
**Prompt**: Initialize the backend Node.js project and install all required dependencies for Express, PostgreSQL, authentication, and file uploads.

**Actions**:
1. Navigate to `backend/` directory
2. Run `npm init -y` to create package.json
3. Install production dependencies:
   - `npm install express` - Web framework
   - `npm install pg` - PostgreSQL client
   - `npm install dotenv` - Environment variables
   - `npm install cors` - Cross-origin resource sharing
   - `npm install bcryptjs` - Password hashing
   - `npm install jsonwebtoken` - JWT token generation/validation
   - `npm install multer` - File upload handling
   - `npm install express-validator` - Input validation
4. Install development dependencies:
   - `npm install --save-dev nodemon` - Auto-restart server on changes
5. Update package.json scripts:
   ```json
   "scripts": {
     "start": "node src/server.js",
     "dev": "nodemon src/server.js"
   }
   ```
6. Set `"type": "commonjs"` in package.json (or use ES modules if preferred)

**Expected Outcome**: backend/package.json with all dependencies installed and dev script configured.

**Commit Message**: `feat: Initialize backend package.json and install Express, PostgreSQL, and auth dependencies`

---

### Task 3: Create Backend Environment Configuration
**Prompt**: Create environment configuration files for the backend including database connection, JWT secret, and server settings.

**Actions**:
1. Create `backend/.env` file with:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=recipe_hub
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here_change_in_production
   JWT_EXPIRES_IN=7d
   
   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```
2. Create `backend/.env.example` as template (without actual secrets)
3. Update `backend/.gitignore` to include:
   ```
   node_modules/
   .env
   uploads/*
   !uploads/.gitkeep
   *.log
   ```
4. Create `backend/uploads/.gitkeep` to track empty uploads directory

**Expected Outcome**: Backend environment variables configured, .env file created (not committed), .env.example provided.

**Commit Message**: `feat: Add backend environment configuration with .env.example template`

---

### Task 4: Create PostgreSQL Database
**Prompt**: Create the PostgreSQL database for Recipe Hub and verify connection.

**Actions**:
1. Start PostgreSQL service if not running:
   - macOS: `brew services start postgresql` or `pg_ctl -D /usr/local/var/postgres start`
   - Linux: `sudo systemctl start postgresql`
   - Windows: Start PostgreSQL service from Services app
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Create database:
   ```sql
   CREATE DATABASE recipe_hub;
   ```
4. Verify database created:
   ```sql
   \l
   ```
5. Exit psql: `\q`
6. Create `backend/src/config/database.js` for database connection:
   ```javascript
   const { Pool } = require('pg');
   require('dotenv').config();
   
   const pool = new Pool({
     host: process.env.DB_HOST,
     port: process.env.DB_PORT,
     database: process.env.DB_NAME,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
   });
   
   pool.on('connect', () => {
     console.log('✅ PostgreSQL connected successfully');
   });
   
   pool.on('error', (err) => {
     console.error('❌ PostgreSQL connection error:', err);
     process.exit(-1);
   });
   
   module.exports = pool;
   ```

**Expected Outcome**: PostgreSQL database `recipe_hub` created, database.js connection module created.

**Commit Message**: `feat: Create PostgreSQL database and connection configuration`

---

### Task 5: Create Basic Express Server
**Prompt**: Create the main Express server file with basic middleware, database connection test, and health check endpoint.

**Actions**:
1. Create `backend/src/server.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const db = require('./config/database');
   
   // Load environment variables
   dotenv.config();
   
   const app = express();
   const PORT = process.env.PORT || 5000;
   
   // Middleware
   app.use(cors());
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   
   // Serve uploaded files
   app.use('/uploads', express.static('uploads'));
   
   // Health check endpoint
   app.get('/api/health', (req, res) => {
     res.json({ 
       status: 'ok', 
       message: 'Recipe Hub API is running',
       timestamp: new Date().toISOString()
     });
   });
   
   // Test database connection
   app.get('/api/db-test', async (req, res) => {
     try {
       const result = await db.query('SELECT NOW()');
       res.json({ 
         status: 'success', 
         message: 'Database connection successful',
         timestamp: result.rows[0].now
       });
     } catch (error) {
       res.status(500).json({ 
         status: 'error', 
         message: 'Database connection failed',
         error: error.message
       });
     }
   });
   
   // Start server
   app.listen(PORT, () => {
     console.log(`🚀 Server running on http://localhost:${PORT}`);
     console.log(`📊 Environment: ${process.env.NODE_ENV}`);
   });
   ```
2. Test server:
   ```bash
   cd backend
   npm run dev
   ```
3. Verify endpoints in browser or with curl:
   - http://localhost:5000/api/health
   - http://localhost:5000/api/db-test

**Expected Outcome**: Express server running on port 5000, health check and database test endpoints working.

**Commit Message**: `feat: Create Express server with CORS, health check, and database test endpoint`

---

### Task 6: Initialize Frontend React App
**Prompt**: Create the React frontend application using Create React App and install required dependencies.

**Actions**:
1. Navigate to project root directory
2. Create React app in frontend folder:
   ```bash
   npx create-react-app frontend
   ```
3. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
4. Install additional dependencies:
   - `npm install react-router-dom` - Client-side routing
   - `npm install redux react-redux` - State management
   - `npm install @reduxjs/toolkit` - Redux toolkit for easier Redux
   - `npm install axios` - HTTP client for API calls
   - `npm install react-toastify` - Toast notifications
5. Remove unnecessary files from Create React App:
   ```bash
   cd src
   rm App.test.js logo.svg reportWebVitals.js setupTests.js
   ```
6. Update `frontend/package.json` to use port 3000 (should be default)

**Expected Outcome**: React app created in frontend/ directory with routing, Redux, and API dependencies installed.

**Commit Message**: `feat: Initialize React app with Create React App and install routing, Redux, and Axios`

---

### Task 7: Create Frontend Directory Structure
**Prompt**: Create the organized directory structure for React components, pages, Redux state, services, and utilities.

**Actions**:
1. Create frontend directory structure:
   ```bash
   cd frontend/src
   mkdir components
   mkdir pages
   mkdir redux
   mkdir redux/actions
   mkdir redux/reducers
   mkdir services
   mkdir utils
   mkdir assets
   mkdir assets/images
   mkdir assets/styles
   ```
2. Create `.gitkeep` files in empty directories to track them in Git
3. Create `frontend/src/redux/store.js` placeholder for Redux store
4. Create `frontend/src/services/api.js` placeholder for API service
5. Create `frontend/src/utils/constants.js` for app constants

**Expected Outcome**: Frontend directory structure organized for components, pages, Redux, and services.

**Commit Message**: `feat: Create frontend directory structure for components, Redux, and services`

---

### Task 8: Configure Frontend Environment Variables
**Prompt**: Create environment configuration for frontend to connect to backend API.

**Actions**:
1. Create `frontend/.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=Recipe Hub
   ```
2. Create `frontend/.env.example`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=Recipe Hub
   ```
3. Update `frontend/.gitignore` to include:
   ```
   # See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
   
   # dependencies
   /node_modules
   /.pnp
   .pnp.js
   
   # testing
   /coverage
   
   # production
   /build
   
   # misc
   .DS_Store
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   ```
4. Create `frontend/src/config/api.js`:
   ```javascript
   export const API_URL = process.env.REACT_APP_API_URL;
   export const APP_NAME = process.env.REACT_APP_NAME;
   ```

**Expected Outcome**: Frontend environment variables configured to connect to backend API.

**Commit Message**: `feat: Configure frontend environment variables for API connection`

---

### Task 9: Create Basic React App Structure
**Prompt**: Create a minimal working React app with basic routing setup and connection test to backend.

**Actions**:
1. Update `frontend/src/index.js`:
   ```javascript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import './index.css';
   import App from './App';
   
   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```
2. Update `frontend/src/App.js`:
   ```javascript
   import React from 'react';
   import './App.css';
   
   function App() {
     return (
       <div className="App">
         <header className="App-header">
           <h1>Recipe Hub</h1>
           <p>Full-Stack Recipe Sharing Application</p>
           <p>Backend API: {process.env.REACT_APP_API_URL}</p>
         </header>
       </div>
     );
   }
   
   export default App;
   ```
3. Update `frontend/src/App.css` with basic styling
4. Test React app:
   ```bash
   cd frontend
   npm start
   ```
5. Verify app opens at http://localhost:3000

**Expected Outcome**: React app running on port 3000, displaying Recipe Hub homepage.

**Commit Message**: `feat: Create basic React app structure with homepage display`

---

### Task 10: Create Root-Level Configuration Files
**Prompt**: Create root-level package.json, README, and .gitignore for the monorepo structure.

**Actions**:
1. Create `package.json` in root directory:
   ```json
   {
     "name": "recipe-hub",
     "version": "1.0.0",
     "description": "Full-stack recipe sharing application with meal planning and shopping lists",
     "scripts": {
       "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install",
       "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
       "backend": "cd backend && npm run dev",
       "frontend": "cd frontend && npm start"
     },
     "keywords": ["recipe", "meal-planning", "react", "node", "postgresql"],
     "author": "Vasilena Stanoyska",
     "license": "ISC"
   }
   ```
2. Install concurrently for running both servers:
   ```bash
   npm install --save-dev concurrently
   ```
3. Update root `.gitignore`:
   ```
   # Dependencies
   node_modules/
   
   # Environment variables
   .env
   .env.local
   
   # Build outputs
   build/
   dist/
   
   # Logs
   *.log
   logs/
   
   # OS files
   .DS_Store
   Thumbs.db
   
   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   
   # Uploads
   backend/uploads/*
   !backend/uploads/.gitkeep
   ```
4. Create `README.md` in root:
   ```markdown
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
   └── .planning/        # GSD workflow artifacts
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
   
   ## License
   ISC
   ```

**Expected Outcome**: Root-level configuration complete with package.json, README, and .gitignore.

**Commit Message**: `feat: Add root-level package.json, README, and .gitignore for monorepo`

---

### Task 11: Verify Complete Setup and Test End-to-End Connection
**Prompt**: Verify that both frontend and backend are running correctly and can communicate with each other.

**Actions**:
1. Start PostgreSQL service
2. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. Verify backend endpoints work:
   - Open http://localhost:5000/api/health in browser
   - Open http://localhost:5000/api/db-test in browser
   - Both should return JSON responses
4. In a new terminal, start frontend:
   ```bash
   cd frontend
   npm start
   ```
5. Verify frontend opens at http://localhost:3000
6. Test both servers running concurrently from root:
   ```bash
   npm run dev
   ```
7. Create a verification checklist document:
   ```bash
   touch .planning/phases/01-foundation/VERIFICATION.md
   ```
8. Document verification results in VERIFICATION.md:
   ```markdown
   # Phase 1 Verification
   
   ## Success Criteria Verification
   
   - [x] Frontend React app runs on localhost:3000
   - [x] Backend Express server runs on localhost:5000
   - [x] PostgreSQL database connection successful
   - [x] All dependencies installed
   - [x] Environment variables configured
   - [x] Git repository properly configured with .gitignore
   
   ## Manual Testing Results
   
   ### Backend Tests
   - [x] GET /api/health - Returns status ok
   - [x] GET /api/db-test - Returns database timestamp
   - [x] Server starts without errors
   - [x] Database connection established
   
   ### Frontend Tests
   - [x] React app loads at localhost:3000
   - [x] No console errors
   - [x] Homepage displays "Recipe Hub"
   - [x] Environment variable (API_URL) accessible
   
   ### Integration Tests
   - [x] Both servers run concurrently with `npm run dev`
   - [x] No port conflicts
   - [x] CORS configured correctly
   
   ## Issues Found
   None
   
   ## Phase 1 Status
   ✅ Complete - All success criteria met
   ```

**Expected Outcome**: Complete verification that Phase 1 setup is working correctly, documented in VERIFICATION.md.

**Commit Message**: `test: Verify Phase 1 complete - frontend, backend, and database all running`

---

## Post-Phase Actions

### Update Project State
Update `.planning/STATE.md`:
- Mark Phase 1 as complete
- Update current phase to Phase 2
- Document any issues or learnings

### Git Status Check
Ensure all changes are committed and pushed to GitHub:
```bash
git status
git log --oneline -11
```

### Next Steps
Ready to move to Phase 2: Database Schema & Models
- Run `/gsd:plan-phase 2` to create detailed plan
- Or run `/gsd:discuss-phase 2` if you want to discuss the approach first

---

## Summary

**Total Tasks**: 11 atomic tasks  
**Estimated Time**: 2-3 hours  
**Commits Expected**: 11 commits (one per task)  
**Phase Dependencies**: None (this is Phase 1)  
**Blocking Issues**: Must have PostgreSQL installed and running

**Technology Setup**:
- ✅ React 18 with Create React App
- ✅ Express.js with CORS and middleware
- ✅ PostgreSQL with pg driver
- ✅ JWT + bcrypt for future auth
- ✅ Multer for future file uploads
- ✅ Redux + React Router for future features

**Ready for Execution**: Yes - all tasks are executable and atomic
