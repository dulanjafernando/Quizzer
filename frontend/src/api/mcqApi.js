import axios from 'axios';

const API_URL = 'http://localhost:5000/api/mcqs';

// Get all MCQs
export const getAllMCQs = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get MCQs by category
export const getMCQsByCategory = async (category) => {
  const response = await axios.get(`${API_URL}/category/${category}`);
  return response.data;
};

// Get single MCQ
export const getMCQById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create new MCQ
export const createMCQ = async (mcqData) => {
  const response = await axios.post(API_URL, mcqData);
  return response.data;
};

// Update MCQ
export const updateMCQ = async (id, mcqData) => {
  const response = await axios.put(`${API_URL}/${id}`, mcqData);
  return response.data;
};

// Delete MCQ
export const deleteMCQ = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
