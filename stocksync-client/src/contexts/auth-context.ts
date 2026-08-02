import { createContext } from "react";

/**
 * Represents the authenticated StockSync user returned
 * by the backend login endpoint.
 */
export interface AuthenticatedUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthContextValue {
  token: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (
    token: string,
    user: AuthenticatedUser,
    rememberMe?: boolean,
  ) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);