import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AuthContext,
  type AuthenticatedUser,
  type AuthContextValue,
} from "@/contexts/auth-context";

/* ============================================================
   Authentication Configuration
============================================================ */

const AUTH_TOKEN_KEY = "stocksync_auth_token";
const AUTH_USER_KEY = "stocksync_authenticated_user";
const SESSION_EXPIRED_EVENT = "stocksync:session-expired";

/* ============================================================
   Types
============================================================ */

/**
 * Defines the properties accepted by the authentication provider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/* ============================================================
   Storage Helpers
============================================================ */

/**
 * Retrieves the current authentication token from persistent
 * or session-based browser storage.
 */
const getStoredToken = (): string | null => {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
};

/**
 * Retrieves and parses the authenticated user stored
 * alongside the current access token.
 *
 * Invalid stored JSON is removed to prevent the application
 * from loading corrupted authentication state.
 */
const getStoredUser = (): AuthenticatedUser | null => {
  const storedUser =
    localStorage.getItem(AUTH_USER_KEY) ??
    sessionStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthenticatedUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);

    return null;
  }
};

/**
 * Removes authentication information from every supported
 * browser storage location.
 */
const clearStoredSession = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
};

/* ============================================================
   Provider
============================================================ */

/**
 * Provides authentication state throughout the application.
 *
 * The provider supports persistent and temporary sessions and
 * synchronises React state when the API reports that a session
 * has expired or become invalid.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<AuthenticatedUser | null>(getStoredUser);

  /**
 * Stores a newly issued JWT and authenticated user using the
 * selected session persistence preference.
 *
 * @param newToken - JWT returned by the authentication API.
 * @param authenticatedUser - User details returned by the authentication API.
 * @param rememberMe - Whether the session should survive browser restarts.
 */
  const login = useCallback(
    (
      newToken: string,
      authenticatedUser: AuthenticatedUser,
      rememberMe = true,
    ): void => {
      clearStoredSession();

      const serializedUser = JSON.stringify(authenticatedUser);

      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        localStorage.setItem(AUTH_USER_KEY, serializedUser);
      } else {
        sessionStorage.setItem(AUTH_TOKEN_KEY, newToken);
        sessionStorage.setItem(AUTH_USER_KEY, serializedUser);
      }

      setToken(newToken);
      setUser(authenticatedUser);
    },
    [],
  );

  /**
   * Clears the active session from browser storage and
   * authentication state.
   */
  const logout = useCallback((): void => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Synchronises React authentication state when the API client
   * detects an expired or invalid authenticated session.
   *
   * Navigation remains the responsibility of the Axios interceptor,
   * while this listener ensures context consumers are immediately
   * updated before the redirect occurs.
   */
  useEffect(() => {
    const handleSessionExpired = (): void => {
      logout();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [logout]);

  /**
   * Memoises the context value so consumers only re-render when
   * authentication state or actions change.
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "Admin",
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
