from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
import random
from ai_generator import AIQuestionGenerator
from database import init_db
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

@app.route('/api/themes', methods=['GET'])
def get_themes():
    """Get all available themes"""
    conn = get_db_connection()
    themes = conn.execute('SELECT * FROM themes ORDER BY name').fetchall()
    conn.close()
    
    return jsonify([dict(theme) for theme in themes])

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
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO user_responses (question_id, selected_option, session_id)
        VALUES (?, ?, ?)
    ''', (data['question_id'], data['selected_option'], session_id))
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
