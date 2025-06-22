import sqlite3
import os
from datetime import datetime

def init_db():
    """Initialize the database with required tables"""
    db_path = 'game.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create themes table (updated to support user-created themes)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_by INTEGER, -- NULL for system themes, user_id for custom themes
            is_public BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id),
            UNIQUE(name, created_by) -- Allow same name for different users
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
            user_id INTEGER, -- NULL for anonymous users
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create user_sessions table for login management
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert default themes (system themes with created_by = NULL)
    default_themes = [
        ('General', 'General everyday scenarios', None),
        ('Food', 'Food and dining related choices', None),
        ('Entertainment', 'Movies, games, and fun activities', None),
        ('Travel', 'Travel and adventure scenarios', None),
        ('Career', 'Work and career related decisions', None),
        ('Superpowers', 'Fictional abilities and powers', None),
        ('Technology', 'Tech and gadget related choices', None),
        ('Lifestyle', 'Daily life and habits', None)
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO themes (name, description, created_by) VALUES (?, ?, ?)
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

# Add utility functions for user management
def create_user(username, email, password_hash):
    """Create a new user"""
    conn = sqlite3.connect('game.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        user_id = cursor.lastrowid
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user_by_username(username):
    """Get user by username"""
    conn = sqlite3.connect('game.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    user = cursor.execute('''
        SELECT * FROM users WHERE username = ?
    ''', (username,)).fetchone()
    
    conn.close()
    return dict(user) if user else None

def get_user_by_email(email):
    """Get user by email"""
    conn = sqlite3.connect('game.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    user = cursor.execute('''
        SELECT * FROM users WHERE email = ?
    ''', (email,)).fetchone()
    
    conn.close()
    return dict(user) if user else None

def create_user_session(user_id, session_token, expires_at):
    """Create a new user session"""
    conn = sqlite3.connect('game.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (?, ?, ?)
    ''', (user_id, session_token, expires_at))
    
    conn.commit()
    conn.close()

def get_user_by_session(session_token):
    """Get user by session token"""
    conn = sqlite3.connect('game.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    result = cursor.execute('''
        SELECT u.* FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.session_token = ? AND s.expires_at > datetime('now')
    ''', (session_token,)).fetchone()
    
    conn.close()
    return dict(result) if result else None

def delete_user_session(session_token):
    """Delete a user session (logout)"""
    conn = sqlite3.connect('game.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        DELETE FROM user_sessions WHERE session_token = ?
    ''', (session_token,))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
