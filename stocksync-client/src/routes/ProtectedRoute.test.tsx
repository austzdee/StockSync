import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

const LoginPage = () => {
  const location = useLocation();
  const fromPath = location.state?.from?.pathname ?? "none";

  return (
    <div>
      <h1>Login</h1>
      <p>Requested route: {fromPath}</p>
    </div>
  );
};

const renderRoutes = (initialRoute = "/reports") => {
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <h1>Protected reports</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderRoutes();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Login",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: "Protected reports",
      }),
    ).not.toBeInTheDocument();
  });

  it("preserves the requested route when redirecting", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    renderRoutes("/reports");

    expect(
      screen.getByText("Requested route: /reports"),
    ).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    });

    renderRoutes();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Protected reports",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        level: 1,
        name: "Login",
      }),
    ).not.toBeInTheDocument();
  });
});
