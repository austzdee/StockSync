import stockSyncLogo from "../assets/stocksync-logo.png";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  mobileSidebarOpen: boolean;
  desktopSidebarCollapsed: boolean;
  onCloseMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
}

const navigationItems = [
  { label: "Dashboard", shortLabel: "D", to: "/dashboard" },
  { label: "Products", shortLabel: "P", to: "/products" },
  { label: "Warehouses", shortLabel: "W", to: "/warehouses" },
  { label: "Stock Operations", shortLabel: "S", to: "/stock-transfers" },
  { label: "Audit Logs", shortLabel: "A", to: "/audit-logs" },
  { label: "Reports", shortLabel: "R", to: "/reports" },
];

const Sidebar = ({
  mobileSidebarOpen,
  desktopSidebarCollapsed,
  onCloseMobileSidebar,
  onToggleDesktopSidebar,
}: SidebarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 border-r border-slate-800 bg-slate-950 transition-all duration-300
      ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      ${desktopSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
      w-64 lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            {!desktopSidebarCollapsed && (
              <div>
                <img
                  src={stockSyncLogo}
                  alt="StockSync logo"
                  className="max-h-16 w-36 object-contain"
                />

                <p className="mt-2 hidden text-xs text-slate-500 sm:block">
                  Inventory Management Platform
                </p>
              </div>
            )}

            {desktopSidebarCollapsed && (
              <img
                src={stockSyncLogo}
                alt="StockSync logo"
                className="mx-auto h-10 w-10 object-contain"
              />
            )}

            <button
              type="button"
              onClick={onCloseMobileSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="mt-4 hidden w-full rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 lg:block"
          >
            {desktopSidebarCollapsed ? "→" : "Collapse"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onCloseMobileSidebar}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                      desktopSidebarCollapsed
                        ? "justify-center px-2"
                        : "justify-start"
                    } ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {desktopSidebarCollapsed ? item.shortLabel : item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;