import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ============================================================
   Authentication Configuration
============================================================ */

const AUTH_TOKEN_KEY = "stocksync_auth_token";
const SESSION_EXPIRED_EVENT = "stocksync:session-expired";

/* ============================================================
   Types
============================================================ */

/**
 * Defines the authentication state and actions available
 * throughout the frontend application.
 */
interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

/**
 * Defines the properties accepted by the authentication provider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/* ============================================================
   Context
============================================================ */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ============================================================
   Storage Helpers
============================================================ */

/**
 * Retrieves the currently stored authentication token.
 *
 * Persistent sessions use localStorage, while temporary browser
 * sessions use sessionStorage.
 */
const getStoredToken = (): string | null => {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
};

/**
 * Removes authentication information from every supported
 * browser storage location.
 */
const clearStoredToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
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

  /**
   * Stores a newly issued JWT using the user's selected
   * session persistence preference.
   *
   * @param newToken - JWT returned by the authentication API.
   * @param rememberMe - Whether the session should survive
   * browser restarts.
   */
  const login = useCallback(
    (newToken: string, rememberMe = true): void => {
      clearStoredToken();

      if (rememberMe) {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      } else {
        sessionStorage.setItem(AUTH_TOKEN_KEY, newToken);
      }

      setToken(newToken);
    },
    [],
  );

  /**
   * Clears the active session from browser storage and
   * authentication state.
   */
  const logout = useCallback((): void => {
    clearStoredToken();
    setToken(null);
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

    window.addEventListener(
      SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [logout]);

  /**
   * Memoises the context value so consumers only re-render when
   * authentication state or actions change.
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* ============================================================
   Hook
============================================================ */

/**
 * Provides safe access to the authentication context.
 *
 * @throws Error when used outside the AuthProvider.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};