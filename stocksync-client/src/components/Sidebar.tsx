const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">
          Stock<span className="text-cyan-400">Sync</span>
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Inventory Management
        </p>
      </div>

      <nav className="px-4">
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