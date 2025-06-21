import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const HomePage = () => {
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
      setError('Failed to load themes. Please try again later.');
      console.error('Error fetching themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getThemeColor = (index) => {
    const colors = [
      'border-red-500',
      'border-blue-500',
      'border-green-500',
      'border-yellow-500',
      'border-purple-500',
      'border-pink-500',
      'border-indigo-500',
      'border-teal-500',
    ];
    return colors[index % colors.length];
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
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
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          🤔 Would You Rather?
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Test your decision-making skills with our AI-powered "Would You Rather" game! 
          Choose from different themes or play a completely random game.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/game"
            className="btn-primary text-lg px-8 py-4"
          >
            🎲 Play Random Game
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
            className="btn-secondary text-lg px-8 py-4"
          >
            🎯 Choose Theme
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-slide-up">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI-Powered Questions</h3>
          <p className="text-gray-600">
            Our AI generates fresh, creative questions on the fly for endless entertainment.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="text-4xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold mb-2">Multiple Themes</h3>
          <p className="text-gray-600">
            Choose from various themes like food, travel, superpowers, and more!
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">See Results</h3>
          <p className="text-gray-600">
            View how others answered and compare your choices with the community.
          </p>
        </div>
      </div>

      {/* Themes Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Choose Your Theme
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme, index) => (
            <Link
              key={theme.id}
              to={`/theme/${theme.id}`}
              className={`theme-card ${getThemeColor(index)} hover:scale-105 transform transition-all duration-200`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{getThemeEmoji(theme.name)}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {theme.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {theme.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Make Some Tough Choices?</h2>
        <p className="text-lg mb-6 opacity-90">
          Start playing now and see how your decisions compare with others!
        </p>
        <Link
          to="/game"
          className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Start Playing Now! 🚀
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
