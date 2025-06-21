import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

const ThemePage = ({ sessionId }) => {
  const { themeId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (themeId) {
      fetchQuestionForTheme();
    }
  }, [themeId]);

  const fetchQuestionForTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedOption(null);
      setShowResults(false);
      setAnswered(false);
      setStats(null);
      
      const questionData = await api.getQuestionByTheme(themeId);
      setQuestion(questionData);
    } catch (err) {
      setError('Failed to load question. Please try again.');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuestion = async () => {
    try {
      setGenerating(true);
      await api.generateQuestion(themeId);
      // After generating, fetch a new question
      await fetchQuestionForTheme();
    } catch (err) {
      setError('Failed to generate new question. Please try again.');
      console.error('Error generating question:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleOptionSelect = async (option) => {
    if (answered) return;

    setSelectedOption(option);
    setAnswered(true);

    try {
      // Save the response
      await api.saveResponse(question.id, option, sessionId);
      
      // Fetch and show stats
      const statsData = await api.getQuestionStats(question.id);
      setStats(statsData);
      setShowResults(true);
    } catch (err) {
      console.error('Error saving response:', err);
      // Still show results even if saving failed
      try {
        const statsData = await api.getQuestionStats(question.id);
        setStats(statsData);
        setShowResults(true);
      } catch (statsErr) {
        console.error('Error fetching stats:', statsErr);
        setShowResults(true);
      }
    }
  };

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
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
          <p className="text-lg text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        <div className="space-x-4">
          <button 
            onClick={fetchQuestionForTheme}
            className="btn-primary"
          >
            Try Again
          </button>
          <Link 
            to="/"
            className="btn-secondary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg mb-4">No questions available for this theme.</div>
        <button 
          onClick={fetchQuestionForTheme}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {getThemeEmoji(question.theme_name)} {question.theme_name} Theme
        </h1>
        <p className="text-lg text-gray-600 mb-4">{question.theme_description}</p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            ← Back to Themes
          </Link>
          <span className="text-gray-400">|</span>
          <Link 
            to="/game" 
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            🎲 Random Game
          </Link>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          🤔 Would You Rather...
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Option A */}
          <div
            onClick={() => handleOptionSelect('A')}
            className={`option-card ${selectedOption === 'A' ? 'selected' : ''} ${
              answered ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-4">🅰️</div>
              <p className="text-lg font-medium text-gray-800 mb-4">
                {question.option_a}
              </p>
              {showResults && stats && (
                <div className="mt-4">
                  <div className="bg-primary-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${getPercentage(stats.option_a_count, stats.total_responses)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getPercentage(stats.option_a_count, stats.total_responses)}% 
                    ({stats.option_a_count} votes)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Option B */}
          <div
            onClick={() => handleOptionSelect('B')}
            className={`option-card ${selectedOption === 'B' ? 'selected' : ''} ${
              answered ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-4">🅱️</div>
              <p className="text-lg font-medium text-gray-800 mb-4">
                {question.option_b}
              </p>
              {showResults && stats && (
                <div className="mt-4">
                  <div className="bg-secondary-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-secondary-600 h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${getPercentage(stats.option_b_count, stats.total_responses)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getPercentage(stats.option_b_count, stats.total_responses)}% 
                    ({stats.option_b_count} votes)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!answered && (
          <p className="text-center text-gray-500 mt-6">
            Click on an option to make your choice!
          </p>
        )}
      </div>

      {/* Results Summary */}
      {showResults && stats && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-up">
          <h3 className="text-xl font-semibold text-center mb-4">
            📊 Results Summary
          </h3>
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Total responses: <span className="font-semibold">{stats.total_responses}</span>
            </p>
            <p className="text-sm">
              {question.ai_generated ? '🤖 This question was generated by AI' : '📝 This is a curated question'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={fetchQuestionForTheme}
          className="btn-primary text-lg px-8 py-3"
        >
          🔄 Next Question in This Theme
        </button>
        <button
          onClick={generateNewQuestion}
          disabled={generating}
          className={`btn-secondary text-lg px-8 py-3 ${
            generating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {generating ? (
            <>
              <span className="animate-spin inline-block mr-2">⚙️</span>
              Generating...
            </>
          ) : (
            '🤖 Generate New AI Question'
          )}
        </button>
      </div>
    </div>
  );
};

export default ThemePage;
