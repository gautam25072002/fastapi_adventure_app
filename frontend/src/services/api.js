import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({ baseURL: BASE_URL });

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

// Adventure
export const startAdventure = (data) => api.post("/adventure/start", data);
export const makeChoice = (sessionId, choice) =>
  api.post(`/adventure/${sessionId}/choice`, { choice });
export const getSessions = () => api.get("/adventure/");
export const getSession = (sessionId) => api.get(`/adventure/${sessionId}`);
export const deleteSession = (sessionId) => api.delete(`/adventure/${sessionId}`);