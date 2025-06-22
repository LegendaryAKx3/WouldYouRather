import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Migrate existing database to new schema"""
    db_path = 'game.db'
    
    if not os.path.exists(db_path):
        print("No existing database found. Creating new database...")
        from database import init_db
        init_db()
        return
    
    print("Migrating existing database...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get list of existing tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    existing_tables = [row[0] for row in cursor.fetchall()]
    
    # Create users table if it doesn't exist
    if 'users' not in existing_tables:
        print("Creating users table...")
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    # Create user_sessions table if it doesn't exist
    if 'user_sessions' not in existing_tables:
        print("Creating user_sessions table...")
        cursor.execute('''
            CREATE TABLE user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
    
    # Check if themes table needs migration
    cursor.execute("PRAGMA table_info(themes)")
    themes_columns = [row[1] for row in cursor.fetchall()]
    
    if 'created_by' not in themes_columns:
        print("Migrating themes table...")
        # Create new themes table
        cursor.execute('''
            CREATE TABLE themes_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_by INTEGER,
                is_public BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id),
                UNIQUE(name, created_by)
            )
        ''')
        
        # Copy data from old table
        cursor.execute('''
            INSERT INTO themes_new (id, name, description, created_by, is_public, created_at)
            SELECT id, name, description, NULL, TRUE, created_at FROM themes
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE themes')
        cursor.execute('ALTER TABLE themes_new RENAME TO themes')
    
    # Check if user_responses table needs migration
    cursor.execute("PRAGMA table_info(user_responses)")
    responses_columns = [row[1] for row in cursor.fetchall()]
    
    if 'user_id' not in responses_columns:
        print("Migrating user_responses table...")
        # Create new user_responses table
        cursor.execute('''
            CREATE TABLE user_responses_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER,
                selected_option TEXT,
                session_id TEXT,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (question_id) REFERENCES questions (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Copy data from old table
        cursor.execute('''
            INSERT INTO user_responses_new (id, question_id, selected_option, session_id, user_id, created_at)
            SELECT id, question_id, selected_option, session_id, NULL, created_at FROM user_responses
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE user_responses')
        cursor.execute('ALTER TABLE user_responses_new RENAME TO user_responses')
    
    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database()
