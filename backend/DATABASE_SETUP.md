# PostgreSQL Database Setup

## Prerequisites
PostgreSQL must be installed on your system.

## Installation

### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Create Database

After PostgreSQL is installed and running:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE recipe_hub;

# Verify
\l

# Exit
\q
```

## Update .env

Make sure your `backend/.env` file has the correct database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipe_hub
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

## Test Connection

Run the backend server to test the database connection:

```bash
cd backend
npm run dev
```

Visit http://localhost:5000/api/db-test to verify the connection.
