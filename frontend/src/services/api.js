const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Get all themes
  getThemes: async () => {
    const response = await fetch(`${API_BASE_URL}/themes`);
    if (!response.ok) throw new Error('Failed to fetch themes');
    return response.json();
  },

  // Get random question from any theme
  getRandomQuestion: async () => {
    const response = await fetch(`${API_BASE_URL}/questions/random`);
    if (!response.ok) throw new Error('Failed to fetch random question');
    return response.json();
  },

  // Get question for specific theme
  getQuestionByTheme: async (themeId) => {
    const response = await fetch(`${API_BASE_URL}/questions/${themeId}`);
    if (!response.ok) throw new Error('Failed to fetch question for theme');
    return response.json();
  },

  // Save user response
  saveResponse: async (questionId, selectedOption, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${API_BASE_URL}/stats/${questionId}`);
    if (!response.ok) throw new Error('Failed to fetch question stats');
    return response.json();
  },

  // Generate new AI question
  generateQuestion: async (themeId) => {
    const response = await fetch(`${API_BASE_URL}/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme_id: themeId,
      }),
    });
    if (!response.ok) throw new Error('Failed to generate new question');
    return response.json();
  },
};
