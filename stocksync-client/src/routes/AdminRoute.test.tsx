import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AdminRoute from "./AdminRoute";

/**
 * Creates a stable authentication-hook mock before Vitest
 * evaluates the mocked module.
 */
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

/**
 * Replaces the real authentication hook so each test can
 * control the current authentication and administrator state.
 */
vi.mock("@/contexts/useAuth", () => ({
  useAuth: mockUseAuth,
}));

/**
 * Displays the current route after a redirect.
 *
 * This allows the tests to verify the destination selected
 * by AdminRoute.
 */
const CurrentPage = () => {
  const location = useLocation();

  return <p>Current location: {location.pathname}</p>;
};

/**
 * Renders the administrator route inside an in-memory router.
 *
 * The route begins at /users and includes the possible login
 * and dashboard redirect destinations.
 */
const renderAdminRoute = () => {
  render(
    <MemoryRouter initialEntries={["/users"]}>
      <Routes>
        <Route
          path="/users"
          element={
            <AdminRoute>
              <h1>User Administration</h1>
            </AdminRoute>
          }
        />

        <Route path="/login" element={<CurrentPage />} />
        <Route path="/dashboard" element={<CurrentPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("AdminRoute", () => {
  /**
   * Clears the authentication mock before each test so every
   * scenario starts with an independent call history.
   */
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    /**
     * Represents a visitor without an authenticated session.
     */
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
    });

    renderAdminRoute();

    expect(
      await screen.findByText("Current location: /login"),
    ).toBeInTheDocument();
  });

  it("redirects authenticated non-admin users to dashboard", async () => {
    /**
     * Represents an authenticated user without administrator
     * permissions.
     */
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
    });

    renderAdminRoute();

    expect(
      await screen.findByText("Current location: /dashboard"),
    ).toBeInTheDocument();
  });

  it("renders the protected page for administrators", () => {
    /**
     * Represents an authenticated administrator.
     */
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
    });

    renderAdminRoute();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "User Administration",
      }),
    ).toBeInTheDocument();
  });
});
