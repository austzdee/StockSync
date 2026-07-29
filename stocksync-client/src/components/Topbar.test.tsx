import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Topbar from "./Topbar";

vi.mock("../contexts/useAuth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}));

const renderTopbar = (route: string) => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Topbar onOpenMobileSidebar={vi.fn()} />
    </MemoryRouter>,
  );
};

describe("Topbar", () => {
  it.each([
    ["/dashboard", "Dashboard"],
    ["/products", "Products"],
    ["/warehouses", "Warehouses"],
    ["/stock-transfers", "Stock Operations"],
    ["/audit-logs", "Audit Logs"],
    ["/reports", "Reports"],
  ])("shows %s route as %s", (route, expectedTitle) => {
    renderTopbar(route);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: expectedTitle,
      }),
    ).toBeInTheDocument();
  });

  it("shows the fallback title for an unknown route", () => {
    renderTopbar("/unknown");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "StockSync",
      }),
    ).toBeInTheDocument();
  });
});