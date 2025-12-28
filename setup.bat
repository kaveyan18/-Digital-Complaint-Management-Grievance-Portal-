@echo off
echo ==========================================
echo Setting up Digital Complaint Portal...
echo ==========================================

echo.
echo [1/3] Installing Backend Dependencies...
cd backend
call npm install
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo IMPORTANT: Please update backend\.env with your database password!
) else (
    echo backend\.env already exists.
)
cd ..

echo.
echo [2/3] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Setup Complete! 
echo.
echo Next Steps:
echo 1. Ensure MySQL is running.
echo 2. Run 'database\schema.sql' in your MySQL client to create the database.
echo 3. Edit 'backend\.env' with your MySQL password.
echo 4. Run 'run.bat' to start the application.
pause
