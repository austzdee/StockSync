import stockSyncLogo from "../assets/stocksync-logo.png";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800">
      {/* Logo Section */}
      <div className="border-b border-slate-800 p-6">
        <img
          src={stockSyncLogo}
          alt="StockSync logo"
          className="w-full max-w-[180px] object-contain"
        />

        <p className="mt-3 text-xs text-slate-500">
          Inventory Management Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Products
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/warehouses"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Warehouses
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/stock-transfers"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Stock Operations
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Audit Logs
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `block w-full rounded-lg px-4 py-3 text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Reports
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
