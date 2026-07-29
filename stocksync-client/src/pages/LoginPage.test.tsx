import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import LoginPage from "./LoginPage";

/**
 * Creates stable mock functions before Vitest evaluates
 * the mocked authentication modules.
 */
const { mockLoginContext, mockLoginUser } = vi.hoisted(() => ({
  mockLoginContext: vi.fn(),
  mockLoginUser: vi.fn(),
}));

/**
 * Suppresses the expected console error produced by the
 * failed-authentication test while still allowing us to verify it.
 */
const consoleErrorSpy = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

/**
 * Clears console calls after every test so assertions from
 * one test cannot affect another test.
 */
afterEach(() => {
  consoleErrorSpy.mockClear();
});

/**
 * Replaces the real authentication context hook.
 *
 * LoginPage will call this mocked login function after
 * receiving a successful authentication response.
 */
vi.mock("@/contexts/useAuth", () => ({
  useAuth: () => ({
    login: mockLoginContext,
  }),
}));

/**
 * Replaces the real backend authentication request.
 *
 * Individual tests control whether this request resolves
 * successfully or rejects with an error.
 */
vi.mock("@/services/authService", () => ({
  login: mockLoginUser,
}));

/**
 * Represents the page reached after a successful login.
 *
 * Displaying the current route allows the tests to verify
 * both default and protected-route redirects.
 */
const DestinationPage = () => {
  const location = useLocation();

  return (
    <div>
      <h1>Destination</h1>

      <p>
        Current location: {location.pathname}
        {location.search}
        {location.hash}
      </p>
    </div>
  );
};

/**
 * Renders LoginPage within an in-memory router.
 *
 * The initial entry can include router state produced by
 * ProtectedRoute when redirecting an unauthenticated user.
 */
const renderLoginPage = (
  initialEntry:
    | string
    | {
        pathname: string;
        state?: {
          from?: {
            pathname: string;
            search?: string;
            hash?: string;
          };
        };
      } = "/login",
) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DestinationPage />} />
        <Route path="/reports" element={<DestinationPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("LoginPage", () => {
  /**
   * Resets authentication mocks before each test so each
   * scenario begins with an isolated call history.
   */
  beforeEach(() => {
    mockLoginContext.mockReset();
    mockLoginUser.mockReset();
  });

  it("submits trimmed credentials and redirects to the dashboard", async () => {
    const user = userEvent.setup();

    /**
     * Simulates a successful response from the authentication API.
     */
    mockLoginUser.mockResolvedValue({
      token: "test-token",
    });

    renderLoginPage();

    /**
     * Includes surrounding spaces to verify that LoginPage
     * trims the email before sending it to the API.
     */
    await user.type(
      screen.getByRole("textbox", {
        name: "Email address",
      }),
      "  admin@stocksync.test  ",
    );

    await user.type(
      screen.getByLabelText("Password"),
      "ValidPassword123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign in to StockSync",
      }),
    );

    /**
     * Verifies the exact credentials sent to the backend service.
     */
    expect(mockLoginUser).toHaveBeenCalledWith({
      email: "admin@stocksync.test",
      password: "ValidPassword123!",
    });

    /**
     * Remember me is enabled by default, so the session
     * should be persisted.
     */
    expect(mockLoginContext).toHaveBeenCalledWith(
      "test-token",
      true,
    );

    /**
     * A direct login should redirect to the dashboard.
     */
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Destination",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Current location: /dashboard"),
    ).toBeInTheDocument();
  });

  it("returns the user to the originally requested protected route", async () => {
    const user = userEvent.setup();

    mockLoginUser.mockResolvedValue({
      token: "test-token",
    });

    /**
     * Recreates the navigation state supplied by ProtectedRoute.
     */
    renderLoginPage({
      pathname: "/login",
      state: {
        from: {
          pathname: "/reports",
          search: "?view=low-stock",
          hash: "#results",
        },
      },
    });

    await user.type(
      screen.getByRole("textbox", {
        name: "Email address",
      }),
      "admin@stocksync.test",
    );

    await user.type(
      screen.getByLabelText("Password"),
      "ValidPassword123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign in to StockSync",
      }),
    );

    /**
     * Confirms that pathname, query string and hash are all preserved.
     */
    expect(
      await screen.findByText(
        "Current location: /reports?view=low-stock#results",
      ),
    ).toBeInTheDocument();
  });

  it("passes the disabled remember-me preference to the auth context", async () => {
    const user = userEvent.setup();

    mockLoginUser.mockResolvedValue({
      token: "test-token",
    });

    renderLoginPage();

    await user.type(
      screen.getByRole("textbox", {
        name: "Email address",
      }),
      "admin@stocksync.test",
    );

    await user.type(
      screen.getByLabelText("Password"),
      "ValidPassword123!",
    );

    /**
     * Remember me begins enabled, so clicking it disables
     * persistent-session storage.
     */
    await user.click(
      screen.getByRole("checkbox", {
        name: /remember me/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign in to StockSync",
      }),
    );

    expect(mockLoginContext).toHaveBeenCalledWith(
      "test-token",
      false,
    );
  });

  it("shows an accessible error message when authentication fails", async () => {
    const user = userEvent.setup();

    /**
     * Simulates rejected credentials from the authentication API.
     */
    mockLoginUser.mockRejectedValue(
      new Error("Invalid credentials"),
    );

    renderLoginPage();

    await user.type(
      screen.getByRole("textbox", {
        name: "Email address",
      }),
      "admin@stocksync.test",
    );

    await user.type(
      screen.getByLabelText("Password"),
      "IncorrectPassword",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign in to StockSync",
      }),
    );

    /**
     * The failure message must be exposed through an alert role
     * so assistive technologies announce it.
     */
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in with those credentials",
    );

    /**
     * Confirms that the expected diagnostic error was logged.
     *
     * This assertion belongs inside this failure-path test because
     * the console call does not occur until submission has failed.
     */
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Login failed",
      expect.any(Error),
    );

    /**
     * A rejected login must never create an authenticated session.
     */
    expect(mockLoginContext).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    const passwordInput = screen.getByLabelText("Password");

    /**
     * Passwords must be concealed initially.
     */
    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show password",
      }),
    );

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    );

    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );
  });
});