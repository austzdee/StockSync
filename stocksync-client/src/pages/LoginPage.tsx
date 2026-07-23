import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { login as loginUser } from "@/services/authService";

/**
 * Defines the navigation state provided by ProtectedRoute.
 */
interface LoginLocationState {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}


/**
 * Defines the platform capabilities displayed within
 * the authentication information panel.
 */
const platformHighlights = [
  {
    title: "Multi-warehouse control",
    description: "Manage inventory across connected warehouse locations.",
    icon: Building2,
  },
  {
    title: "Operational reporting",
    description: "Monitor stock levels, valuation and low-stock activity.",
    icon: BarChart3,
  },
  {
    title: "Secure workflows",
    description: "Protect inventory operations with role-based access.",
    icon: ShieldCheck,
  },
];

/**
 * Provides the StockSync authentication experience.
 *
 * The page combines platform branding with a secure login form
 * while preserving the existing backend authentication workflow.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  /**
   * Stores the current authentication form values.
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  /**
   * Controls password visibility, request progress
   * and authentication error feedback.
   */
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


/**
 * Resolves the protected route the user originally requested.
 *
 * The dashboard is used when the login page was opened directly.
 */
const routeState = location.state as LoginLocationState | null;

const redirectPath = routeState?.from
  ? `${routeState.from.pathname}${routeState.from.search ?? ""}${
      routeState.from.hash ?? ""
    }`
  : "/dashboard";

  /**
   * Authenticates the user and redirects successful
   * sessions to the protected dashboard.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      login(response.token, rememberMe);
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      console.error("Login failed", error);

      setErrorMessage(
        "Unable to sign in with those credentials. Check your email and password, then try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ============================================================
             Platform Information Panel
             Connects the authentication experience to the visual
             identity established by the public landing page.
        ============================================================ */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          {/* Decorative background elements */}
          <div
            className="absolute -left-32 -top-32 size-96 rounded-full bg-cyan-400/20 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-40 -right-24 size-[28rem] rounded-full bg-blue-500/20 blur-3xl"
            aria-hidden="true"
          />

          {/* ========================================================
               Brand Navigation
          ======================================================== */}
          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="Return to the StockSync landing page"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-950/30">
                <Boxes className="size-5" aria-hidden="true" />
              </span>

              <div>
                <p className="font-semibold">StockSync</p>

                <p className="text-sm text-cyan-300">
                  Inventory Management Platform
                </p>
              </div>
            </Link>
          </div>

          {/* ========================================================
               Platform Value Proposition
          ======================================================== */}
          <div className="relative my-16 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Connected inventory operations
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight xl:text-5xl">
              Manage inventory with clarity, control and confidence.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-background/70">
              Access warehouse operations, stock workflows, reporting and audit
              history through one secure management platform.
            </p>

            {/* Platform capability highlights */}
            <div className="mt-10 space-y-6">
              {platformHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="font-semibold">{title}</h2>

                    <p className="mt-1 text-sm leading-6 text-background/60">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform status */}
          <div className="relative flex items-center gap-2 text-sm text-background/60">
            <span
              className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              aria-hidden="true"
            />
            Secure StockSync authentication
          </div>
        </section>

        {/* ============================================================
             Authentication Panel
             Contains the login form and mobile branding.
        ============================================================ */}
        <section className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile brand navigation */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-3"
                aria-label="Return to the StockSync landing page"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
                  <Boxes className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <p className="font-semibold">StockSync</p>

                  <p className="text-xs text-muted-foreground">
                    Inventory Management Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Return to landing page */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to home
            </Link>

            {/* ========================================================
                 Login Form Header
            ======================================================== */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Secure sign in
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-muted-foreground">
                Enter your credentials to access the StockSync dashboard.
              </p>
            </div>

            {/* Authentication error feedback */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {/* ========================================================
                 Login Form
            ======================================================== */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {/* Password visibility control */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isLoading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Session preference */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 size-4 rounded border accent-blue-600"
                />

                <span>
                  <span className="block text-sm font-medium">Remember me</span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Keep this session active after closing the browser.
                  </span>
                </span>
              </label>

              {/* Submit authentication request */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in to StockSync"
                )}
              </Button>
            </form>

            {/* Authentication support notice */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Access is restricted to authorised StockSync users.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
