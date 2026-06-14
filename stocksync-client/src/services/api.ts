import axios from "axios";

const AUTH_TOKEN_KEY = "stocksync_auth_token";

/**
 * Centralized Axios instance.
 * All API requests should use this client.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attaches the JWT token to outgoing API requests when available.
 * This allows protected backend endpoints to authorize the logged-in user.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});