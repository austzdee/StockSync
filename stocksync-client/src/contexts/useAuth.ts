import { useContext } from "react";

import {
  AuthContext,
  type AuthContextValue,
} from "@/contexts/auth-context";

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