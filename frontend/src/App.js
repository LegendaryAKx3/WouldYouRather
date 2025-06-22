import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import ThemePage from './components/ThemePage';
import StatsPage from './components/StatsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CreateThemePage from './components/CreateThemePage';
import Navigation from './components/Navigation';
import { api } from './services/api';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('wyr-session-id');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('wyr-session-id', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Check for existing user session
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const userData = await api.getCurrentUser();
      if (userData) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const handleLogin = (userData) => {
    setUser(userData.user);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  if (loading) {    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Navigation user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/game" element={<GamePage sessionId={sessionId} user={user} />} />
            <Route path="/theme/:themeId" element={<ThemePage sessionId={sessionId} user={user} />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
            <Route path="/create-theme" element={<CreateThemePage user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
