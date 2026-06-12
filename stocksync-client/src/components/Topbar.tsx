import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Topbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-6">
      <h2 className="text-lg font-semibold text-white">
        Dashboard
      </h2>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        Logout
      </button>
    </header>
  );
};

export default Topbar;