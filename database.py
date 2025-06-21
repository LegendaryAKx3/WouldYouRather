import sqlite3
import os
from datetime import datetime

def init_db():
    """Initialize the database with required tables"""
    db_path = 'game.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create themes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create questions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            theme_id INTEGER,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            ai_generated BOOLEAN DEFAULT FALSE,
            times_used INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (theme_id) REFERENCES themes (id)
        )
    ''')
    
    # Create user_responses table (for analytics)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            selected_option TEXT, -- 'A' or 'B'
            session_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    ''')
    
    # Insert default themes
    default_themes = [
        ('General', 'General everyday scenarios'),
        ('Food', 'Food and dining related choices'),
        ('Entertainment', 'Movies, games, and fun activities'),
        ('Travel', 'Travel and adventure scenarios'),
        ('Career', 'Work and career related decisions'),
        ('Superpowers', 'Fictional abilities and powers'),
        ('Technology', 'Tech and gadget related choices'),
        ('Lifestyle', 'Daily life and habits')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO themes (name, description) VALUES (?, ?)
    ''', default_themes)
    
    # Insert some sample questions
    sample_questions = [
        (1, "Would you rather be able to fly or be invisible?", "Would you rather have super strength or super speed?"),
        (2, "Would you rather eat pizza every day or never eat pizza again?", "Would you rather only eat sweet foods or only eat savory foods?"),
        (3, "Would you rather live in a world without music or without movies?", "Would you rather be in a comedy movie or a horror movie?"),
        (4, "Would you rather travel to the past or the future?", "Would you rather explore space or the deep ocean?"),
        (6, "Would you rather have the ability to read minds or predict the future?", "Would you rather control time or control gravity?")
    ]
    
    for theme_id, option_a, option_b in sample_questions:
        cursor.execute('''
            INSERT OR IGNORE INTO questions (theme_id, option_a, option_b, ai_generated) 
            VALUES (?, ?, ?, FALSE)
        ''', (theme_id, option_a, option_b))
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()
