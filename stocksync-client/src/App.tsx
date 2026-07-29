import { lazy, Suspense, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

/**
 * Loads page components only when their matching route is visited.
 *
 * Route-level lazy loading prevents every application page from being
 * included in the initial JavaScript bundle downloaded by the browser.
 */
const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const StockTransfersPage = lazy(
  () => import("./pages/StockTransfersPage"),
);
const WarehousesPage = lazy(
  () => import("./pages/WarehousesPage"),
);

/**
 * Provides accessible feedback while a lazy-loaded route bundle
 * is being downloaded and evaluated.
 */
const RouteLoadingFallback = () => (
  <main
    className="flex min-h-screen items-center justify-center bg-background px-6"
    aria-busy="true"
    aria-live="polite"
  >
    <p className="text-sm font-medium text-muted-foreground">
      Loading StockSync...
    </p>
  </main>
);

/**
 * Wraps protected content with the existing authentication boundary.
 *
 * Keeping this wrapper in one place reduces duplicated route markup and
 * ensures every protected page uses the same loading behaviour.
 */
const protectedPage = (page: ReactNode) => (
  <ProtectedRoute>{page}</ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Public-facing website routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
          </Route>

          {/* Authentication route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected inventory-management routes */}
          <Route
            path="/dashboard"
            element={protectedPage(<DashboardPage />)}
          />

          <Route
            path="/products"
            element={protectedPage(<ProductsPage />)}
          />

          <Route
            path="/warehouses"
            element={protectedPage(<WarehousesPage />)}
          />

          <Route
            path="/stock-transfers"
            element={protectedPage(<StockTransfersPage />)}
          />

          <Route
            path="/reports"
            element={protectedPage(<ReportsPage />)}
          />

          <Route
            path="/audit-logs"
            element={protectedPage(<AuditLogsPage />)}
          />

          {/* Unknown public URLs return visitors to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
