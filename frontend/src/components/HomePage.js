import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const HomePage = ({ user }) => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchThemes();
  }, [user]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const themesData = await api.getThemes();
      setThemes(themesData);
    } catch (err) {
      setError('Failed to load themes. Please try again later.');
      console.error('Error fetching themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getThemeEmoji = (themeName) => {
    const emojiMap = {
      'General': '🌟',
      'Food': '🍕',
      'Entertainment': '🎬',
      'Travel': '✈️',
      'Career': '💼',
      'Superpowers': '⚡',
      'Technology': '💻',
      'Lifestyle': '🏡',
    };
    return emojiMap[themeName] || '🎭';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading themes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchThemes}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          🤔 Would You Rather?
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Test your decision-making skills with our AI-powered "Would You Rather" game! 
          Choose from different themes or play a completely random game.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/game"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            🎲 Play Random Game
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            🎯 Choose Theme
          </button>
          {user && (
            <Link
              to="/create-theme"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              🎨 Create Theme
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-3 text-white">AI-Powered Questions</h3>
          <p className="text-gray-300">
            Our AI generates fresh, creative questions on the fly for endless entertainment.
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-bold mb-3 text-white">Custom Themes</h3>
          <p className="text-gray-300">
            {user ? 'Create your own themes and get AI-generated questions for them!' : 'Register to create custom themes with AI-generated questions!'}
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-3 text-white">Track Progress</h3>
          <p className="text-gray-300">
            {user ? 'Your responses are saved to your account for personalized statistics.' : 'Create an account to track your game history and preferences.'}
          </p>
        </div>
      </div>

      {/* Themes Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Choose Your Theme
          </h2>
          {user && (
            <Link
              to="/create-theme"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              🎨 Create Custom Theme
            </Link>
          )}
        </div>
        
        {!user && (
          <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-200">
              💡 <Link to="/register" className="text-yellow-300 font-semibold hover:underline">Create an account</Link> to make your own custom themes with AI-generated questions!
            </p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => (
            <Link
              key={theme.id}
              to={`/theme/${theme.id}`}
              className="card hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{getThemeEmoji(theme.name)}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {theme.name}
                  {theme.created_by && (
                    <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      Custom
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-300 mb-2">
                  {theme.description}
                </p>
                {theme.created_by && theme.created_by_username && (
                  <p className="text-xs text-gray-400">
                    by {theme.created_by_username}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Make Some Tough Choices?</h2>
        <p className="text-lg mb-6 opacity-90">
          Start playing now and see how your decisions compare with others!
        </p>
        <Link
          to="/game"
          className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
        >
          Start Playing Now! 🚀
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
