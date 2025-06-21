import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import ThemePage from './components/ThemePage';
import StatsPage from './components/StatsPage';
import Navigation from './components/Navigation';

function App() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('wyr-session-id');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('wyr-session-id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  const generateSessionId = () => {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GamePage sessionId={sessionId} />} />
            <Route path="/theme/:themeId" element={<ThemePage sessionId={sessionId} />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
