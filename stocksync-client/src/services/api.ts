import axios from "axios";

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