import axios from 'axios';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const normalizeApiBase = (rawUrl) => {
  const fallback = 'http://localhost:5000';
  const base = (rawUrl || fallback).trim().replace(/\/+$/, '');
  if (base.endsWith('/api')) return base;
  return `${base}/api`;
};

const resolveApiBase = () => {
  const configured = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (configured) return normalizeApiBase(configured);

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (LOCAL_HOSTS.has(host)) {
      return normalizeApiBase('http://localhost:5000');
    }
    // In production with no env, try same-origin /api (works behind reverse proxy).
    return normalizeApiBase(window.location.origin);
  }

  return normalizeApiBase('http://localhost:5000');
};

const API_BASE = resolveApiBase();

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    '[NextCareer] Missing VITE_API_URL. Falling back to same-origin API base:',
    API_BASE
  );
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nextcareer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const path = window.location.pathname;
    const isAuthPage = path === '/login' || path === '/register';

    if (status === 401 && !isAuthPage) {
      localStorage.removeItem('nextcareer_token');
      localStorage.removeItem('nextcareer_user');
      window.location.href = '/login';
    }

    if (!err.response) {
      err.isNetworkError = true;
      err.apiBaseURL = API_BASE;
      err.message = 'Network error. Please check backend URL, CORS, and internet connection.';
    }

    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// User
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => {
  const formData = new FormData();
  
  // Append text fields
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.education !== undefined) formData.append('education', data.education);
  if (data.experienceLevel !== undefined) formData.append('experienceLevel', data.experienceLevel);
  if (data.preferredTrack !== undefined) formData.append('preferredTrack', data.preferredTrack);
  if (data.cvText !== undefined) formData.append('cvText', data.cvText);
  
  // Append arrays as JSON strings
  if (data.skills !== undefined) formData.append('skills', JSON.stringify(data.skills));
  if (data.interests !== undefined) formData.append('interests', JSON.stringify(data.interests));
  
  // Append avatar file if it's a File object
  if (data.avatarFile) {
    formData.append('avatar', data.avatarFile);
  }
  
  return api.put('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Jobs
export const getJobs = (params) => api.get('/jobs', { params });
export const getRecommendedJobs = () => api.get('/jobs/recommended');
export const getJobMatchDetail = (id) => api.get(`/jobs/${id}/match`);

// Resources
export const getResources = (params) => api.get('/resources', { params });

// AI
export const extractSkills = (text) => api.post('/ai/extract-skills', { text });
export const extractSkillsFromPDF = (file) => {
  const formData = new FormData();
  formData.append('cv', file);
  return api.post('/ai/extract-skills-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const mergeSkills = (extractedSkills) => api.post('/ai/merge-skills', { extractedSkills });
export const generateRoadmap = (targetRole, duration) => api.post('/ai/roadmap', { targetRole, duration });
export const getUserRoadmaps = () => api.get('/ai/roadmap');
export const getRoadmapById = (id) => api.get(`/ai/roadmap/${id}`);
export const careerBot = (question) => api.post('/ai/career-bot', { question });

// CareerBot Chat (ChatGPT-style)
export const getChatSession = () => api.get('/careerbot/session');
export const getChatSessions = () => api.get('/careerbot/sessions');
export const createChatSession = () => api.post('/careerbot/session');
export const deleteChatSession = (sessionId) => api.delete(`/careerbot/session/${sessionId}`);
export const getChatHistory = (sessionId) => api.get(`/careerbot/history/${sessionId}`);
export const sendChatMessage = (message, sessionId) => api.post('/careerbot/chat', { message, sessionId });

// Admin API
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const getAdminUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
