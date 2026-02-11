import axios from 'axios';

const API_URL = 'http://localhost:5000/api/quiz-history';

// Save quiz result to database
export const saveQuizResult = async (quizData) => {
  try {
    const response = await axios.post(API_URL, quizData);
    return response.data;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

// Get all quiz history for a user
export const getQuizHistory = async (userId = 'guest') => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    throw error;
  }
};

// Get quiz history by category
export const getQuizHistoryByCategory = async (userId = 'guest', category) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}/${category}`);
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
    const response = await axios.delete(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all quiz history:', error);
    throw error;
  }
};
