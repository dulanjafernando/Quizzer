import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

const saveUserData = (user, token) => {
  if (user && token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id || user._id); // Store user ID for quiz history
    localStorage.setItem('userName', user.name || 'User'); // Store user name for display
    localStorage.setItem('userEmail', user.email || ''); // Store user email for display
    setAuthHeader(token);
  }
};

export const signup = async ({ name, email, password }) => {
  const response = await axios.post(`${API_URL}/signup`, { name, email, password });
  const data = response.data;
  if (data && data.token && data.user) {
    saveUserData(data.user, data.token);
  }
  return data;
};

export const login = async ({ email, password }) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  const data = response.data;
  if (data && data.token && data.user) {
    saveUserData(data.user, data.token);
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  setAuthHeader(null);
};

export const updateProfile = async (userId, { name, newPassword, currentPassword }) => {
  const response = await axios.put(`${API_URL}/profile/${userId}`, {
    name,
    newPassword,
    currentPassword
  });
  const data = response.data;
  if (data && data.token && data.user) {
    saveUserData(data.user, data.token);
  }
  return data;
};

// Initialize header if token exists on app load
const existingToken = localStorage.getItem('token');
if (existingToken) setAuthHeader(existingToken);

export default { signup, login, logout };
