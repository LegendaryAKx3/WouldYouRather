from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import random
import hashlib
import secrets
from datetime import datetime, timedelta
from ai_generator import AIQuestionGenerator
from database import init_db, create_user, get_user_by_username, get_user_by_email, create_user_session, get_user_by_session, delete_user_session
import os

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()

# Initialize AI generator
ai_generator = AIQuestionGenerator()

def get_db_connection():
    conn = sqlite3.connect('game.db')
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_session_token():
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def get_current_user(request):
    """Get current user from session token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return get_user_by_session(token)

@app.route('/api/themes', methods=['GET'])
def get_themes():
    """Get all available themes (system + user's custom themes)"""
    user = get_current_user(request)
    
    conn = get_db_connection()
    if user:
        # Get system themes + user's custom themes + public custom themes
        themes = conn.execute('''
            SELECT t.*, u.username as created_by_username 
            FROM themes t 
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.created_by IS NULL 
               OR t.created_by = ? 
               OR (t.created_by IS NOT NULL AND t.is_public = TRUE)
            ORDER BY t.created_by IS NULL DESC, t.name
        ''', (user['id'],)).fetchall()
    else:
        # Only system themes for anonymous users
        themes = conn.execute('''
            SELECT t.*, NULL as created_by_username 
            FROM themes t 
            WHERE t.created_by IS NULL 
            ORDER BY t.name
        ''').fetchall()
    
    conn.close()
    
    return jsonify([dict(theme) for theme in themes])

@app.route('/api/themes', methods=['POST'])
def create_theme():
    """Create a new custom theme"""
    user = get_current_user(request)
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'description')):
        return jsonify({'error': 'Missing name or description'}), 400
    
    name = data['name'].strip()
    description = data['description'].strip()
    is_public = data.get('is_public', True)
    
    if len(name) < 3:
        return jsonify({'error': 'Theme name must be at least 3 characters'}), 400
    
    conn = get_db_connection()
    
    # Check if user already has a theme with this name
    existing = conn.execute('''
        SELECT id FROM themes WHERE name = ? AND created_by = ?
    ''', (name, user['id'])).fetchone()
    
    if existing:
        conn.close()
        return jsonify({'error': 'You already have a theme with this name'}), 409
    
    # Create theme
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO themes (name, description, created_by, is_public)
        VALUES (?, ?, ?, ?)
    ''', (name, description, user['id'], is_public))
    
    theme_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'theme_id': theme_id,
        'name': name,
        'description': description,
        'is_public': is_public
    })

@app.route('/api/questions/<int:theme_id>', methods=['GET'])
def get_question(theme_id):
    """Get a random question for a specific theme, generate new one if needed"""
    conn = get_db_connection()
    
    # First, try to get an existing question
    questions = conn.execute('''
        SELECT q.*, t.name as theme_name, t.description as theme_description
        FROM questions q 
        JOIN themes t ON q.theme_id = t.id 
        WHERE q.theme_id = ? 
        ORDER BY RANDOM() 
        LIMIT 1
    ''', (theme_id,)).fetchall()
    
    if questions:
        question = dict(questions[0])
        # Update usage count
        conn.execute('UPDATE questions SET times_used = times_used + 1 WHERE id = ?', (question['id'],))
        conn.commit()
        conn.close()
        return jsonify(question)
    
    # If no questions exist, get theme info for AI generation
    theme = conn.execute('SELECT * FROM themes WHERE id = ?', (theme_id,)).fetchone()
    conn.close()
    
    if not theme:
        return jsonify({'error': 'Theme not found'}), 404
    
    # Generate new question with AI
    ai_question = ai_generator.generate_question(theme['name'], theme['description'])
    
    if ai_question:
        # Save the AI-generated question
        question_id = ai_generator.save_ai_question(
            theme_id, 
            ai_question['option_a'], 
            ai_question['option_b']
        )
        
        if question_id:
            # Return the new question
            conn = get_db_connection()
            new_question = conn.execute('''
                SELECT q.*, t.name as theme_name, t.description as theme_description
                FROM questions q 
                JOIN themes t ON q.theme_id = t.id 
                WHERE q.id = ?
            ''', (question_id,)).fetchone()
            conn.close()
            
            return jsonify(dict(new_question))
    
    return jsonify({'error': 'Could not generate question'}), 500

@app.route('/api/questions/random', methods=['GET'])
def get_random_question():
    """Get a completely random question from any theme"""
    conn = get_db_connection()
    questions = conn.execute('''
        SELECT q.*, t.name as theme_name, t.description as theme_description
        FROM questions q 
        JOIN themes t ON q.theme_id = t.id 
        ORDER BY RANDOM() 
        LIMIT 1
    ''').fetchall()
    
    if questions:
        question = dict(questions[0])
        # Update usage count
        conn.execute('UPDATE questions SET times_used = times_used + 1 WHERE id = ?', (question['id'],))
        conn.commit()
        conn.close()
        return jsonify(question)
    
    conn.close()
    return jsonify({'error': 'No questions available'}), 404

@app.route('/api/responses', methods=['POST'])
def save_response():
    """Save user's response to a question"""
    data = request.get_json()
    
    if not data or 'question_id' not in data or 'selected_option' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    session_id = data.get('session_id', str(uuid.uuid4()))
    user = get_current_user(request)
    user_id = user['id'] if user else None
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO user_responses (question_id, selected_option, session_id, user_id)
        VALUES (?, ?, ?, ?)
    ''', (data['question_id'], data['selected_option'], session_id, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'session_id': session_id})

@app.route('/api/stats/<int:question_id>', methods=['GET'])
def get_question_stats(question_id):
    """Get statistics for a specific question"""
    conn = get_db_connection()
    
    stats = conn.execute('''
        SELECT 
            selected_option,
            COUNT(*) as count
        FROM user_responses 
        WHERE question_id = ?
        GROUP BY selected_option
    ''', (question_id,)).fetchall()
    
    question = conn.execute('SELECT * FROM questions WHERE id = ?', (question_id,)).fetchone()
    conn.close()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    result = {
        'question_id': question_id,
        'total_responses': sum(stat['count'] for stat in stats),
        'option_a_count': 0,
        'option_b_count': 0
    }
    
    for stat in stats:
        if stat['selected_option'] == 'A':
            result['option_a_count'] = stat['count']
        elif stat['selected_option'] == 'B':
            result['option_b_count'] = stat['count']
    
    return jsonify(result)

@app.route('/api/generate-question', methods=['POST'])
def generate_new_question():
    """Generate a new AI question for a specific theme"""
    data = request.get_json()
    
    if not data or 'theme_id' not in data:
        return jsonify({'error': 'Theme ID required'}), 400
    
    theme_id = data['theme_id']
    
    conn = get_db_connection()
    theme = conn.execute('SELECT * FROM themes WHERE id = ?', (theme_id,)).fetchone()
    conn.close()
    
    if not theme:
        return jsonify({'error': 'Theme not found'}), 404
    
    # Generate new question with AI
    ai_question = ai_generator.generate_question(theme['name'], theme['description'])
    
    if ai_question:
        # Save the AI-generated question
        question_id = ai_generator.save_ai_question(
            theme_id, 
            ai_question['option_a'], 
            ai_question['option_b']
        )
        
        if question_id:
            return jsonify({
                'success': True,
                'question_id': question_id,
                'option_a': ai_question['option_a'],
                'option_b': ai_question['option_b']
            })
    
    return jsonify({'error': 'Could not generate question'}), 500

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Validation
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    if '@' not in email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if user already exists
    if get_user_by_username(username):
        return jsonify({'error': 'Username already exists'}), 409
    
    if get_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create user
    password_hash = hash_password(password)
    user_id = create_user(username, email, password_hash)
    
    if user_id:
        # Create session
        session_token = generate_session_token()
        expires_at = datetime.now() + timedelta(days=30)
        create_user_session(user_id, session_token, expires_at)
        
        return jsonify({
            'success': True,
            'token': session_token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        })
    else:
        return jsonify({'error': 'Failed to create user'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ('username', 'password')):
        return jsonify({'error': 'Missing username or password'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    # Get user
    user = get_user_by_username(username)
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Check password
    if user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Create session
    session_token = generate_session_token()
    expires_at = datetime.now() + timedelta(days=30)
    create_user_session(user['id'], session_token, expires_at)
    
    return jsonify({
        'success': True,
        'token': session_token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No session token provided'}), 400
    
    token = auth_header.split(' ')[1]
    delete_user_session(token)
    
    return jsonify({'success': True})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user_info():
    """Get current user info"""
    user = get_current_user(request)
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    return jsonify({
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
