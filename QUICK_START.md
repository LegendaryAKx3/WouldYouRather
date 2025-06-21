# Quick Start Guide - Would You Rather Game

## 🎮 Your Application is Now Running!

### Current Status:
✅ **Backend (Flask)**: Running on http://localhost:5000
✅ **Frontend (React)**: Running on http://localhost:3000
✅ **Database**: Initialized with themes and sample questions
✅ **AI Fallback**: Working with predefined questions

## 🚀 How to Use the Game

### 1. **Home Page** (http://localhost:3000)
- Beautiful landing page with theme selection
- Choose "Play Random Game" for any theme
- Or select a specific theme

### 2. **Game Features**
- **Random Game**: Get questions from any theme
- **Theme-Specific**: Play within a chosen category
- **Real-time Stats**: See how others voted
- **AI Generation**: Fallback questions when needed

### 3. **Available Themes**
- 🌟 General - Everyday scenarios
- 🍕 Food - Food and dining choices
- 🎬 Entertainment - Movies, games, and fun
- ✈️ Travel - Travel and adventure
- 💼 Career - Work and career decisions
- ⚡ Superpowers - Fictional abilities
- 💻 Technology - Tech and gadgets
- 🏡 Lifestyle - Daily life and habits

## 🔧 Adding OpenAI (Optional)

To enable AI-powered question generation:

1. **Get an OpenAI API Key**:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key

2. **Add to Environment**:
   - Open the `.env` file
   - Replace `your_openai_api_key_here` with your actual key
   - Restart the Flask server

3. **Install OpenAI Package** (if needed):
   ```powershell
   pip install openai==1.3.7
   ```

## 🛠️ Development Commands

### Start Both Servers:
```powershell
# Method 1: Use the batch file
.\start.bat

# Method 2: Manual start
# Terminal 1 (Backend):
cd "c:\Users\adamk\Coding Folder\WouldYouRather"
python app.py

# Terminal 2 (Frontend):
cd "c:\Users\adamk\Coding Folder\WouldYouRather\frontend"
npm start
```

### Stop Servers:
- Press `Ctrl+C` in each terminal
- Or close the terminal windows

## 📊 Database Information

- **Location**: `game.db` in the root directory
- **Tables**: themes, questions, user_responses
- **Sample Data**: Included with 8 themes and sample questions

## 🎯 Game Flow

1. **Visit**: http://localhost:3000
2. **Choose**: Random game or specific theme
3. **Answer**: Click on your preferred option
4. **View**: Real-time statistics
5. **Continue**: Get more questions!

## 🔍 Troubleshooting

### Backend Issues:
- Check Flask is running on port 5000
- Verify database file exists
- Check terminal for error messages

### Frontend Issues:
- Ensure React server is on port 3000
- Check browser console for errors
- Verify API calls are reaching backend

### CORS Issues:
- Flask-CORS is configured to allow all origins
- Frontend should connect to backend automatically

## 🎨 Customization

### Add New Themes:
1. Edit `database.py` - add to `default_themes`
2. Run `python database.py` to update database
3. Add emoji mapping in React components

### Modify Questions:
- Edit fallback questions in `ai_generator.py`
- Or add directly to database

### Style Changes:
- Modify TailwindCSS classes in React components
- Update `tailwind.config.js` for theme changes

## 📝 Notes

- **No Login Required**: Uses anonymous sessions
- **Mobile Friendly**: Responsive design
- **Real-time**: Statistics update immediately
- **Scalable**: Ready for production deployment

Enjoy your "Would You Rather" game! 🎮
