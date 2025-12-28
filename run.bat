@echo off
echo Starting Digital Complaint Portal...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo Application is starting in new windows...
echo Backend API will be at: http://localhost:3000
echo Frontend starts at: http://localhost:4200
