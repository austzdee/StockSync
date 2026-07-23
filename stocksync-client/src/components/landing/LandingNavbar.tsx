import { Boxes } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Displays the public navigation used across the StockSync website.
 */
const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="StockSync home"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="text-base font-semibold leading-none">StockSync</p>
            <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
              Inventory Management Platform
            </p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>

          <a
            href="#technology"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Technology
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
          >
            Sign in
          </Button>

          <Button onClick={() => navigate("/login")}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;