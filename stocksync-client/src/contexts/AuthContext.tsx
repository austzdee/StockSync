import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Defines the authentication state and actions
 * available throughout the frontend application.
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

const AUTH_TOKEN_KEY = "stocksync_auth_token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Retrieves an existing authentication token.
 *
 * Persistent sessions use localStorage, while temporary
 * browser sessions use sessionStorage.
 */
const getStoredToken = (): string | null => {
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
};

/**
 * Provides authentication state across the frontend application.
 *
 * The provider supports persistent sessions through localStorage
 * and temporary sessions through sessionStorage.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(getStoredToken);

  /**
   * Stores the JWT token using the selected session preference.
   *
   * @param newToken - JWT returned by the authentication API.
   * @param rememberMe - Determines whether the session survives
   * browser restarts.
   */
  const login = (newToken: string, rememberMe = true) => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, newToken);
    }

    setToken(newToken);
  };

  /**
   * Removes authentication information from all supported
   * browser storage locations.
   */
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    setToken(null);
  };

  /**
   * Memoises the context value to prevent unnecessary
   * consumer re-renders.
   */
  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Provides safe access to the authentication context.
 *
 * An error is thrown when the hook is used outside
 * the AuthProvider component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};