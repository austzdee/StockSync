const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800">
      <div className="border-b border-slate-800 p-6">
  <div className="flex items-center gap-3">
    {/* Placeholder logo icon */}
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 via-stone-500 to-cyan-400 font-bold text-white shadow-lg">
      S
    </div>

    <div>
      <h1 className="text-xl font-bold">
        <span className="text-stone-300">Stock</span>
        <span className="bg-gradient-to-r from-amber-500 to-cyan-400 bg-clip-text text-transparent">
          Sync
        </span>
      </h1>

      <p className="text-xs text-slate-500">
        Inventory Management
      </p>
    </div>
  </div>
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