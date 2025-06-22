import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const GamePage = ({ sessionId }) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  const fetchRandomQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedOption(null);
      setShowResults(false);
      setAnswered(false);
      setStats(null);
      
      const questionData = await api.getRandomQuestion();
      setQuestion(questionData);
    } catch (err) {
      setError('Failed to load question. Please try again.');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
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
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-xl text-dark-600 animate-pulse">Loading a fresh question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4">😕</div>
          <div className="text-red-500 text-lg mb-6">{error}</div>
          <button 
            onClick={fetchRandomQuestion}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-16">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-5xl mb-4">🤔</div>
          <div className="text-dark-600 text-lg mb-6">No questions available.</div>          <button 
            onClick={fetchRandomQuestion}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 gradient-text">
          🎲 Random Would You Rather
        </h1>
        <div className="card inline-block px-6 py-3 bg-primary-500/10 border-primary-500/30">
          <span className="text-primary-400 font-semibold">Theme: {question.theme_name}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-10 mb-12 text-center animate-slide-up">        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
          🤔 Would You Rather...
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Option A */}
          <div
            onClick={() => handleOptionSelect('A')}
            className={`option-card ${selectedOption === 'A' ? 'selected' : ''} ${
              answered ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🅰️</div>              <p className="text-lg font-semibold text-dark-800 mb-6 leading-relaxed">
                {question.option_a}
              </p>              {showResults && stats && (
                <div className="mt-6 animate-fade-in">
                  <div className="bg-dark-200/50 rounded-full h-6 mb-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        width: `${getPercentage(stats.option_a_count, stats.total_responses)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm font-semibold text-dark-600">
                    {getPercentage(stats.option_a_count, stats.total_responses)}% 
                    <span className="text-dark-500">({stats.option_a_count} votes)</span>
                  </div>
                </div>
              )}
            </div>
          </div>          {/* Option B */}
          <div
            onClick={() => handleOptionSelect('B')}
            className={`option-card group ${selectedOption === 'B' ? 'selected glow-accent' : ''} ${
              answered ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🅱️</div>
              <p className="text-lg font-semibold text-dark-800 mb-6 leading-relaxed">
                {question.option_b}
              </p>
              {showResults && stats && (                <div className="mt-6 animate-fade-in">
                  <div className="bg-dark-200/50 rounded-full h-6 mb-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent-500 to-accent-600 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        width: `${getPercentage(stats.option_b_count, stats.total_responses)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm font-semibold text-dark-600">
                    {getPercentage(stats.option_b_count, stats.total_responses)}% 
                    <span className="text-dark-500">({stats.option_b_count} votes)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>        {!answered && (
          <p className="text-center text-dark-500 mt-8 text-lg">
            💭 Click on an option to make your choice!
          </p>
        )}
      </div>

      {/* Results Summary */}
      {showResults && stats && (
        <div className="card p-8 mb-12 text-center animate-slide-up">
          <h3 className="text-2xl font-bold mb-6 text-dark-800 gradient-text">
            📊 Results Summary
          </h3>
          <div className="space-y-4">
            <p className="text-lg text-dark-600">
              Total responses: <span className="font-bold text-primary-400">{stats.total_responses}</span>
            </p>
            <div className="card p-4 bg-primary-500/5 border-primary-500/20">
              <p className="text-sm text-dark-600">
                {question.ai_generated ? '🤖 This question was generated by AI' : '📝 This is a curated question'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <button
          onClick={fetchRandomQuestion}
          className="btn-primary text-lg px-10 py-4 shadow-xl shadow-primary-500/25"
        >
          🎲 Next Random Question
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="btn-secondary text-lg px-8 py-3"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
};

export default GamePage;
