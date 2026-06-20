import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { login as loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Handles user authentication.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginUser({
        email,
        password,
      });

      login(response.token);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);

      setErrorMessage("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-stone-300">Stock</span>
          <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
            Sync
          </span>
        </h1>

        <p className="mt-2 text-slate-400">Sign in to continue</p>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
