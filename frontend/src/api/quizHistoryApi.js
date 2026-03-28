import axios from 'axios';

const API_URL = 'http://localhost:5000/api/quiz-history';

// Save quiz result to database
export const saveQuizResult = async (quizData) => {
  try {
    console.log('[API] saveQuizResult - sending data:', quizData);
    // If logged in, axios has Authorization header set by authApi; backend will attach req.user
    const response = await axios.post(API_URL, quizData);
    console.log('[API] saveQuizResult - response:', response.data);
    console.log('[API] saveQuizResult - response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('[API] saveQuizResult - Error saving quiz result:', error);
    console.error('[API] saveQuizResult - Error status:', error.response?.status);
    console.error('[API] saveQuizResult - Error data:', error.response?.data);
    throw error;
  }
};

// Get all quiz history for a user
export const getQuizAttemptById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/attempt/${id}`);
    return response.data;
  } catch (error) {
    console.error('[API] getQuizAttemptById - Error:', error);
    throw error;
  }
};

export const getQuizHistory = async (userId = 'guest') => {
  try {
    // If logged in, prefer 'me' which the backend will resolve to the authenticated user
    const token = localStorage.getItem('token');
    const idSegment = token ? 'me' : userId;
    console.log('[API] getQuizHistory - userId:', userId, 'token:', !!token, 'endpoint segment:', idSegment)
    const response = await axios.get(`${API_URL}/${idSegment}?t=${Date.now()}`);
    console.log('[API] getQuizHistory - response:', response.data)
    console.log('[API] getQuizHistory - response type:', typeof response.data)
    console.log('[API] getQuizHistory - is array:', Array.isArray(response.data))
    return response.data;
  } catch (error) {
    console.error('[API] getQuizHistory - Error fetching quiz history:', error);
    console.error('[API] getQuizHistory - Error status:', error.response?.status);
    console.error('[API] getQuizHistory - Error data:', error.response?.data);
    throw error;
  }
};

// Get quiz history by category
export const getQuizHistoryByCategory = async (userId = 'guest', category) => {
  try {
    const token = localStorage.getItem('token');
    const idSegment = token ? 'me' : userId;
    const response = await axios.get(`${API_URL}/${idSegment}/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz history by category:', error);
    throw error;
  }
};

// Delete quiz history
export const deleteQuizHistory = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quiz history:', error);
    throw error;
  }
};

// Delete all quiz history for a user
export const deleteAllQuizHistory = async (userId = 'guest') => {
  try {
    const token = localStorage.getItem('token');
    const idSegment = token ? 'me' : userId;
    const response = await axios.delete(`${API_URL}/user/${idSegment}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all quiz history:', error);
    throw error;
  }
};
