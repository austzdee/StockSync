import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

/**
 * Starts the StockSync React application and registers
 * application-wide providers and user-feedback components.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </AuthProvider>
  </StrictMode>,
);
