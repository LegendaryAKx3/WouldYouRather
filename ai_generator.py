try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI not available - will use fallback question generation")

import os
from dotenv import load_dotenv
import json
import sqlite3
from typing import Dict, List, Optional
import random

load_dotenv()

class AIQuestionGenerator:
    def __init__(self):
        if OPENAI_AVAILABLE:
            self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        else:
            self.client = None
            
        # Fallback questions for different themes
        self.fallback_questions = {
            'General': [
                ("Have the ability to time travel but only backwards", "Have the ability to time travel but only forwards"),
                ("Be famous for something embarrassing", "Be completely unknown but respected"),
                ("Always tell the truth", "Always have to lie"),
            ],
            'Food': [
                ("Only eat your favorite food for the rest of your life", "Never eat your favorite food again"),
                ("Have taste buds in your hands", "Have taste buds in your feet"),
                ("Only eat foods that are blue", "Only eat foods that are round"),
            ],
            'Entertainment': [
                ("Live in your favorite movie", "Have your favorite movie character come to real life"),
                ("Only watch comedies for the rest of your life", "Only watch horror movies for the rest of your life"),
                ("Be able to pause real life", "Be able to rewind real life"),
            ],
            'Travel': [
                ("Visit every country but only for one day each", "Live in one foreign country for your entire life"),
                ("Travel only by walking", "Travel only by flying"),
                ("Have free flights anywhere but horrible jet lag", "Never have jet lag but pay full price"),
            ],
            'Career': [
                ("Have your dream job but low pay", "Have a boring job but amazing pay"),
                ("Work 4 days a week but longer hours", "Work 6 days a week but shorter hours"),
                ("Be your own boss but work alone", "Have a great team but strict management"),
            ],
            'Superpowers': [
                ("Read minds but can't turn it off", "Be invisible but only when no one is looking"),
                ("Fly but only 3 feet off the ground", "Run at super speed but can't stop quickly"),
                ("Control fire but be vulnerable to water", "Control water but be vulnerable to electricity"),
            ],
            'Technology': [
                ("Have the latest tech but it breaks every month", "Have old reliable tech that never breaks"),
                ("Live without internet but have all books", "Live without books but have unlimited internet"),
                ("Have a phone that never dies but is super slow", "Have a super fast phone that dies every hour"),
            ],
            'Lifestyle': [
                ("Wake up at 5 AM every day but feel energized", "Sleep until noon but always feel tired"),
                ("Live in a mansion but never leave", "Travel the world but never have a permanent home"),
                ("Have unlimited money but no friends", "Have amazing friends but always struggle financially"),
            ]
        }
        
    def generate_question(self, theme: str, theme_description: str = "") -> Optional[Dict[str, str]]:
        """Generate a new 'Would You Rather' question for the given theme"""
        
        # Try AI generation first if available
        if OPENAI_AVAILABLE and self.client and os.getenv('OPENAI_API_KEY'):
            try:
                return self._generate_ai_question(theme, theme_description)
            except Exception as e:
                print(f"AI generation failed: {e}, falling back to predefined questions")
        
        # Fallback to predefined questions
        return self._generate_fallback_question(theme)
    
    def _generate_ai_question(self, theme: str, theme_description: str = "") -> Optional[Dict[str, str]]:
        """Generate question using OpenAI API"""
        try:
            prompt = f"""
            Generate a creative and engaging "Would You Rather" question for the theme: {theme}
            Theme description: {theme_description}
            
            Rules:
            1. Create two compelling options that are roughly equally appealing/difficult to choose
            2. Make sure both options relate to the theme
            3. Keep each option concise but descriptive (max 100 characters each)
            4. Make it thought-provoking and fun
            5. Avoid overly dark or inappropriate content
            
            Respond with ONLY a JSON object in this exact format:
            {{
                "option_a": "Your first option here",
                "option_b": "Your second option here"
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a creative game designer specializing in 'Would You Rather' questions. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.8
            )
            
            content = response.choices[0].message.content.strip()
            question_data = json.loads(content)
            
            # Validate the response
            if "option_a" in question_data and "option_b" in question_data:
                return question_data
            else:
                return None
                
        except Exception as e:
            print(f"Error generating AI question: {e}")
            return None
    
    def _generate_fallback_question(self, theme: str) -> Optional[Dict[str, str]]:
        """Generate question from predefined list"""
        if theme in self.fallback_questions:
            option_a, option_b = random.choice(self.fallback_questions[theme])
            return {
                "option_a": option_a,
                "option_b": option_b
            }
        
        # Default fallback for unknown themes
        option_a, option_b = random.choice(self.fallback_questions['General'])
        return {
            "option_a": option_a,
            "option_b": option_b
        }
    
    def save_ai_question(self, theme_id: int, option_a: str, option_b: str) -> Optional[int]:
        """Save an AI-generated question to the database"""
        try:
            conn = sqlite3.connect('game.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO questions (theme_id, option_a, option_b, ai_generated) 
                VALUES (?, ?, ?, TRUE)
            ''', (theme_id, option_a, option_b))
            
            question_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return question_id
        except Exception as e:
            print(f"Error saving AI question: {e}")
            return None
