@echo off
echo Starting Would You Rather Game...
echo.

echo Starting Flask backend...
start "Flask Backend" cmd /k "python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting React frontend...
start "React Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
