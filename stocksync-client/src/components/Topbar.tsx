const Topbar = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <h2 className="text-lg font-semibold text-white">
        Dashboard
      </h2>

      <div className="text-sm text-slate-400">
        Welcome, Admin
      </div>
    </header>
  );
};

export default Topbar;