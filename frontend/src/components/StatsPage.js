import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const StatsPage = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const themesData = await api.getThemes();
      setThemes(themesData);
    } catch (err) {
      setError('Failed to load statistics. Please try again later.');
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <button 
          onClick={fetchThemes}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          📊 Game Statistics
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore the themes and see how our AI-powered "Would You Rather" game is growing!
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">🎭</div>
          <div className="text-2xl font-bold text-gray-800">{themes.length}</div>
          <div className="text-gray-600">Available Themes</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-2xl font-bold text-gray-800">AI</div>
          <div className="text-gray-600">Powered Questions</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-gray-800">Real-time</div>
          <div className="text-gray-600">Generation</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-gray-800">Growing</div>
          <div className="text-gray-600">Database</div>
        </div>
      </div>

      {/* Themes Overview */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🎯 Available Themes
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <Link
              key={theme.id}
              to={`/theme/${theme.id}`}
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 text-center"
            >
              <div className="text-2xl mb-2">{getThemeEmoji(theme.name)}</div>
              <div className="font-semibold text-gray-800">{theme.name}</div>
              <div className="text-sm text-gray-600 mt-1">{theme.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">🔬 How Our AI Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold mb-2">Smart Generation</h3>
            <p className="text-sm opacity-90">
              Our AI analyzes themes and creates engaging questions that match the topic perfectly.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="font-semibold mb-2">Smart Storage</h3>
            <p className="text-sm opacity-90">
              Generated questions are saved to our database for future players to enjoy.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Live Results</h3>
            <p className="text-sm opacity-90">
              See real-time statistics on how other players answered the same questions.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to Test Your Decision Making?
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a theme or play randomly - every question is a new adventure!
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/game"
            className="btn-primary text-lg px-8 py-3"
          >
            🎲 Play Random Game
          </Link>
          <Link
            to="/"
            className="btn-secondary text-lg px-8 py-3"
          >
            🎯 Choose Theme
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
