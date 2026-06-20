import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

const Topbar = ({ onOpenMobileSidebar }: TopbarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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

        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
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