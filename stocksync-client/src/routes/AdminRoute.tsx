import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "@/contexts/useAuth";

/**
 * Defines the content rendered when the current user
 * is authorised to access an administrator-only route.
 */
interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Restricts access to routes intended for administrators.
 *
 * Unauthenticated users are redirected to the login page and
 * the requested location is preserved for a possible return
 * after authentication.
 *
 * Authenticated users without the Admin role are redirected
 * to the dashboard.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  /**
   * Sends unauthenticated users to the login page while
   * preserving the route they originally attempted to open.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /**
   * Prevents authenticated non-admin users from viewing
   * administrator-only content.
   */
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * Renders the protected route content for administrators.
   */
  return children;
};

export default AdminRoute;
