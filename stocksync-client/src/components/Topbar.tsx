import { useLocation, useNavigate } from "react-router";

import { useAuth } from "../contexts/useAuth";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/warehouses": "Warehouses",
  "/stock-transfers": "Stock Operations",
  "/audit-logs": "Audit Logs",
  "/reports": "Reports",
};

const Topbar = ({ onOpenMobileSidebar }: TopbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const pageTitle = routeTitles[location.pathname] ?? "StockSync";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        Logout
      </button>
    </header>
  );
};

export default Topbar;