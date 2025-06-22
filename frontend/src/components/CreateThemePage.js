import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const CreateThemePage = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  // Redirect if not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-dark-800 mb-4">
            🔒 Login Required
          </h1>
          <p className="text-dark-600 mb-6">
            You need to be logged in to create custom themes.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');    try {
      await api.createTheme(formData.name, formData.description, formData.isPublic);
      setSuccess('Theme created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🎨 Create Custom Theme
        </h1>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">✨ AI-Powered Questions</h3>
          <p className="text-blue-700 text-sm">
            Once you create your theme, our AI will automatically generate creative "Would You Rather" 
            questions specifically tailored to your theme. The questions will be saved and can be 
            reused by other players if you make your theme public!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Theme Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Space Exploration, Cooking Adventures, Fantasy Worlds"
              minLength="3"
              maxLength="50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose a creative and descriptive name for your theme
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe what kinds of questions this theme should include. The more detailed you are, the better our AI can generate relevant questions!"
              minLength="10"
              maxLength="200"
            />
            <p className="text-sm text-gray-500 mt-1">
              Help our AI understand your theme by providing a detailed description
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this theme public (other users can play questions from this theme)
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? 'Creating Theme...' : 'Create Theme'}
            </button>
            
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 text-center transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">💡 Tips for Great Themes</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific: "Underwater Adventures" is better than "Water"</li>
            <li>• Include context: Mention settings, scenarios, or types of choices</li>
            <li>• Think about your audience: What would make interesting dilemmas?</li>
            <li>• Examples: "Medieval Fantasy Quests", "Modern Dating Dilemmas", "Zombie Apocalypse Survival"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateThemePage;
