# Digital Complaint Management & Grievance Portal

This project is a full-stack web application with an Angular frontend and a Node.js/Express backend.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [MySQL](https://www.mysql.com/) (Service must be running)

## Setup Instructions

### 1. Database Setup

1.  Open your MySQL client (Workbench, Command Line, etc.).
2.  Run the SQL script located at `database/schema.sql` to create the database and tables.
    -   This script creates a database named `complaint_portal`.

### 2. Automatic Setup (Windows)

For a one-click setup, run the `setup.bat` file in this directory. This script will:
-   Install backend dependencies.
-   Install frontend dependencies.
-   Create a `.env` file in the backend directory from `.env.example` (you may need to edit this file with your MySQL password).

### 3. Manual Setup

If you prefer to set up manually:

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

**Frontend:**
```bash
cd frontend
npm install
```

## Running the Application

### Automatic Run (Windows)

Double-click `run.bat` to start both the backend server and the frontend application.
-   Backend runs on `http://localhost:3000`
-   Frontend runs on `http://localhost:4200`

### Manual Run

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## Project Structure

-   `backend/`: Node.js Express API
-   `frontend/`: Angular 18 Application
-   `database/`: SQL scripts for database schema
