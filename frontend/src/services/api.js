const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth-token');
};

// Set auth token in localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth-token', token);
  } else {
    localStorage.removeItem('auth-token');
  }
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Auth methods
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      setAuthToken(data.token);
    }
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      setAuthToken(data.token);
    }
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  logout: async () => {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
    }
    setAuthToken(null);
  },

  getCurrentUser: async () => {
    const token = getAuthToken();
    if (!token) return null;
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        setAuthToken(null); // Clear invalid token
      }
      return null;
    }
    return response.json();
  },

  // Theme methods
  getThemes: async () => {
    const response = await fetch(`${API_BASE_URL}/themes`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch themes');
    return response.json();
  },

  createTheme: async (name, description, isPublic = true) => {
    const response = await fetch(`${API_BASE_URL}/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name,
        description,
        is_public: isPublic,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create theme');
    }
    return response.json();
  },
  // Get random question from any theme
  getRandomQuestion: async () => {
    const response = await fetch(`${API_BASE_URL}/questions/random`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch random question');
    return response.json();
  },

  // Get question for specific theme
  getQuestionByTheme: async (themeId) => {
    const response = await fetch(`${API_BASE_URL}/questions/${themeId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch question for theme');
    return response.json();
  },

  // Save user response
  saveResponse: async (questionId, selectedOption, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        question_id: questionId,
        selected_option: selectedOption,
        session_id: sessionId,
      }),
    });
    if (!response.ok) throw new Error('Failed to save response');
    return response.json();
  },

  // Get question statistics
  getQuestionStats: async (questionId) => {
    const response = await fetch(`${API_BASE_URL}/stats/${questionId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch question stats');
    return response.json();
  },

  // Generate new AI question
  generateQuestion: async (themeId) => {
    const response = await fetch(`${API_BASE_URL}/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        theme_id: themeId,
      }),
    });
    if (!response.ok) throw new Error('Failed to generate new question');
    return response.json();
  },

  // Utility methods
  getAuthToken,
  setAuthToken,
};
