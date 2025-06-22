import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/game', label: 'Random Game', icon: '🎲' },
    { path: '/stats', label: 'Statistics', icon: '📊' },
  ];

  // Add user-specific nav items
  if (user) {
    navItems.push({ path: '/create-theme', label: 'Create Theme', icon: '🎨' });
  }

  return (
    <nav className="glassmorphism border-b border-dark-200/20 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent flex items-center hover:from-primary-300 hover:to-accent-300 transition-all duration-300">
            <span className="mr-2 text-2xl animate-float">🤔</span>
            Would You Rather?
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-dark-700 glassmorphism px-3 py-2 rounded-lg">
                  <span className="text-sm text-dark-500">Welcome,</span>
                  <span className="font-semibold text-primary-400 ml-1">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="btn-ghost text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
