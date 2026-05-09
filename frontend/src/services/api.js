import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach JWT to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Resume
export const uploadResume = (formData) => API.post('/resume/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getResume = () => API.get('/resume');
export const getATSScore = (role) => API.post('/resume/ats-score', { role });

// Interview
export const startInterview = (data) => API.post('/interview/start', data);
export const submitAnswer = (data) => API.post('/interview/submit-answer', data);
export const finishInterview = (interviewId) => API.post('/interview/finish', { interviewId });
export const getInterviewHistory = () => API.get('/interview/history');
export const getInterviewDetails = (id) => API.get(`/interview/${id}`);

// Coding Interview API
export const startCodingInterview = (data) => API.post('/coding/start', data);
export const submitCode = (data) => API.post('/coding/submit', data);
export const getCodingHistory = () => API.get('/coding/history');
export const getCodingSession = (id) => API.get(`/coding/${id}`);

// Analytics
export const getAnalyticsSummary = () => API.get('/analytics/summary');
export const getAdminStats = () => API.get('/analytics/admin/all');

export default API;
