import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Sidebar from "./Sidebar";

/**
 * Creates a stable authentication-hook mock before Vitest
 * evaluates the mocked authentication module.
 */
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

/**
 * Replaces the real authentication hook so each test can
 * control whether the current user is an administrator.
 */
vi.mock("@/contexts/useAuth", () => ({
  useAuth: mockUseAuth,
}));

/**
 * Renders the sidebar with its default expanded desktop state.
 *
 * The callback props are mocked because navigation visibility,
 * rather than sidebar interaction, is the focus of these tests.
 */
const renderSidebar = () => {
  render(
    <MemoryRouter>
      <Sidebar
        mobileSidebarOpen={false}
        desktopSidebarCollapsed={false}
        onCloseMobileSidebar={vi.fn()}
        onToggleDesktopSidebar={vi.fn()}
      />
    </MemoryRouter>,
  );
};

describe("Sidebar", () => {
  /**
   * Resets the authentication mock before each test so every
   * scenario begins with an independent role state.
   */
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows the Users link to administrators", () => {
    /**
     * Represents an authenticated administrator.
     */
    mockUseAuth.mockReturnValue({
      isAdmin: true,
    });

    renderSidebar();

    expect(
      screen.getByRole("link", {
        name: "Users",
      }),
    ).toHaveAttribute("href", "/users");
  });

  it("hides the Users link from non-admin users", () => {
    /**
     * Represents an authenticated standard user.
     */
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    });

    renderSidebar();

    expect(
      screen.queryByRole("link", {
        name: "Users",
      }),
    ).not.toBeInTheDocument();
  });

  it("continues to show standard navigation links to non-admin users", () => {
    /**
     * Confirms that filtering administrator links does not remove
     * navigation options available to all authenticated users.
     */
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    });

    renderSidebar();

    expect(
      screen.getByRole("link", {
        name: "Dashboard",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Products",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Reports",
      }),
    ).toBeInTheDocument();
  });
});