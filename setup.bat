@echo off
echo Setting up Would You Rather Game...
echo.

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Initializing database...
python database.py

echo.
echo Setting up frontend...
cd frontend
npm install

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. Run the backend: python app.py
echo 2. In another terminal, run the frontend: cd frontend && npm start
echo.
echo Don't forget to add your OpenAI API key to the .env file!
pause
