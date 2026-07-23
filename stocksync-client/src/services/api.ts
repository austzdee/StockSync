import axios, { type AxiosError } from "axios";

const AUTH_TOKEN_KEY = "stocksync_auth_token";

/**
 * Retrieves the active authentication token.
 *
 * Persistent sessions use localStorage, while temporary
 * browser sessions use sessionStorage.
 */
const getAuthToken = (): string | null => {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
};

/**
 * Removes authentication data from all supported
 * browser storage locations.
 */
const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Centralised Axios instance used by StockSync services.
 *
 * All frontend API requests should use this client so that
 * authentication and error handling remain consistent.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================================================
   Request Interceptor
   Adds the current JWT to protected API requests.
============================================================ */

/**
 * Attaches the active JWT token to outgoing requests.
 *
 * The token may come from localStorage or sessionStorage,
 * depending on the user's Remember Me preference.
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/* ============================================================
   Response Interceptor
   Handles expired or invalid authenticated sessions globally.
============================================================ */

/**
 * Detects unauthorised responses for authenticated requests.
 *
 * When an existing session becomes invalid, the interceptor:
 * 1. Clears the stored authentication token.
 * 2. Preserves the user's current destination.
 * 3. Redirects the user to the login page.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const statusCode = error.response?.status;
    const token = getAuthToken();

    /*
     * Only treat a 401 response as an expired session when a token
     * already exists. This prevents invalid login credentials from
     * triggering an unnecessary page redirect.
     */
    const hasExpiredSession = statusCode === 401 && Boolean(token);

    if (hasExpiredSession) {
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const isAlreadyOnLoginPage = window.location.pathname === "/login";

      clearAuthToken();

      if (!isAlreadyOnLoginPage) {
        const returnUrl = encodeURIComponent(currentPath);

        window.location.replace(
          `/login?reason=session-expired&returnUrl=${returnUrl}`,
        );
      }
    }

    return Promise.reject(error);
  },
);