import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import WarehousesPage from "./pages/WarehousesPage";
import StockTransfersPage from "./pages/StockTransfersPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root URL to the dashboard page */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public route for user login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes require authentication */}
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
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
