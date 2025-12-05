// src/utils/api.js
import axios from 'axios';

const API_URL = 'https://swastik.tnbpos.in/api'; // Adjust if hosted elsewhere

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;