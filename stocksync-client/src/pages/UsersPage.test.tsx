import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UsersPage from "./UsersPage";

/**
 * Creates stable mocks before Vitest evaluates the mocked modules.
 */
const {
  mockGetUsers,
  mockUpdateUserRole,
  mockUseAuth,
} = vi.hoisted(() => ({
  mockGetUsers: vi.fn(),
  mockUpdateUserRole: vi.fn(),
  mockUseAuth: vi.fn(),
}));

/**
 * Replaces the authentication hook so the tests can define
 * the currently signed-in administrator.
 */
vi.mock("@/contexts/useAuth", () => ({
  useAuth: mockUseAuth,
}));

/**
 * Replaces the user-administration service so tests can control
 * loading, success and failure responses.
 */
vi.mock("@/services/userService", () => ({
  getUsers: mockGetUsers,
  updateUserRole: mockUpdateUserRole,
}));

/**
 * Removes the surrounding application shell from these tests so
 * assertions can focus on the UsersPage behaviour.
 */
vi.mock("@/layouts/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const adminUser = {
  id: 1,
  fullName: "Azure Test User",
  email: "azure@test.com",
  role: "Admin" as const,
};

const standardUser = {
  id: 2,
  fullName: "Test User",
  email: "testuser@example.com",
  role: "User" as const,
};

describe("UsersPage", () => {
  beforeEach(() => {
    mockGetUsers.mockReset();
    mockUpdateUserRole.mockReset();
    mockUseAuth.mockReset();

    mockUseAuth.mockReturnValue({
      user: adminUser,
    });
  });

  it("loads and displays registered users", async () => {
    mockGetUsers.mockResolvedValue([
      adminUser,
      standardUser,
    ]);

    render(<UsersPage />);

    expect(
      screen.getByText("Loading registered users..."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Azure Test User"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("azure@test.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("testuser@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("2 users registered"),
    ).toBeInTheDocument();
  });

  it("identifies the signed-in administrator and disables their controls", async () => {
    mockGetUsers.mockResolvedValue([
      adminUser,
      standardUser,
    ]);

    render(<UsersPage />);

    await screen.findByText("Azure Test User");

    expect(
      screen.getByText("Current account"),
    ).toBeInTheDocument();

    const currentAccountRoleSelect = screen.getByRole(
      "combobox",
      {
        name: "Change role for Azure Test User",
      },
    );

    expect(currentAccountRoleSelect).toBeDisabled();

    const updateButtons = screen.getAllByRole("button", {
      name: "Update role",
    });

    expect(updateButtons[0]).toBeDisabled();
  });

  it("promotes a standard user and shows success feedback", async () => {
    const user = userEvent.setup();

    mockGetUsers.mockResolvedValue([
      adminUser,
      standardUser,
    ]);

    mockUpdateUserRole.mockResolvedValue({
      ...standardUser,
      role: "Admin",
    });

    render(<UsersPage />);

    await screen.findByText("Test User");

    const roleSelect = screen.getByRole("combobox", {
      name: "Change role for Test User",
    });

    await user.selectOptions(roleSelect, "Admin");

    const updateButtons = screen.getAllByRole("button", {
      name: "Update role",
    });

    await user.click(updateButtons[1]);

    expect(mockUpdateUserRole).toHaveBeenCalledWith(
      standardUser.id,
      "Admin",
    );

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(
      "Test User's role was updated to Admin.",
    );

    await waitFor(() => {
      expect(roleSelect).toHaveValue("Admin");
    });
  });

  it("shows an error message when the user list cannot be loaded", async () => {
    mockGetUsers.mockRejectedValue(
      new Error("Request failed"),
    );

    render(<UsersPage />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to load registered users.",
    );

    expect(
      screen.getByRole("button", {
        name: "Try again",
      }),
    ).toBeInTheDocument();
  });

  it("retries loading users after an initial failure", async () => {
    const user = userEvent.setup();

    mockGetUsers
      .mockRejectedValueOnce(new Error("Request failed"))
      .mockResolvedValueOnce([adminUser]);

    render(<UsersPage />);

    await screen.findByRole("alert");

    await user.click(
      screen.getByRole("button", {
        name: "Try again",
      }),
    );

    expect(
      await screen.findByText("Azure Test User"),
    ).toBeInTheDocument();

    expect(mockGetUsers).toHaveBeenCalledTimes(2);
  });
});
