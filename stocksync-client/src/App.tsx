import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuditLogsPage from "./pages/AuditLogsPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import ReportsPage from "./pages/ReportsPage";
import StockTransfersPage from "./pages/StockTransfersPage";
import WarehousesPage from "./pages/WarehousesPage";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-facing website routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Authentication routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected application routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warehouses"
          element={
            <ProtectedRoute>
              <WarehousesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-transfers"
          element={
            <ProtectedRoute>
              <StockTransfersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown public URLs return visitors to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;