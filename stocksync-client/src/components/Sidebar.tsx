import stockSyncLogo from "../assets/stocksync-logo.png";

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
            <button className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
              Dashboard
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
              Products
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
              Warehouses
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
              Stock Transfers
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
              Reports
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;