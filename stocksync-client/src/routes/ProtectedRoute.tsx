import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Defines the properties accepted by the protected-route wrapper.
 */
interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Restricts access to authenticated users.
 *
 * When authentication is missing, the requested location is
 * preserved so the user can return there after signing in.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;