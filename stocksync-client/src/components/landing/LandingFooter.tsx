import { Boxes, Mail } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

/**
 * Displays the public footer for the StockSync platform.
 *
 * Provides navigation, technology information and
 * project attribution.
 */
const LandingFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* ============================================================
               Brand
          ============================================================ */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Boxes className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold">StockSync</h3>

                <p className="text-sm text-muted-foreground">
                  Inventory Management Platform
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              A modern inventory management platform focused on secure stock
              control, warehouse operations and business reporting.
            </p>
          </div>

          {/* ============================================================
               Platform
          ============================================================ */}
          <div>
            <h4 className="font-semibold">Platform</h4>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Products</li>
              <li>Warehouses</li>
              <li>Reports</li>
              <li>Audit Logs</li>
            </ul>
          </div>

          {/* ============================================================
               Technology
          ============================================================ */}
          <div>
            <h4 className="font-semibold">Built With</h4>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>React 19</li>
              <li>TypeScript</li>
              <li>ASP.NET Core .NET 10</li>
              <li>Tailwind CSS</li>
              <li>Azure</li>
            </ul>
          </div>

 {/* ============================================================
     Connect
     Provides quick access to the developer's
     GitHub profile, LinkedIn profile and email.
============================================================ */}
<div>
  <h4 className="font-semibold">
    Connect
  </h4>

  <div className="mt-5 flex gap-3">

    {/* GitHub profile */}
    <a
      href="https://github.com/austzdee"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="flex h-11 w-11 items-center justify-center rounded-lg border transition hover:bg-muted"
    >
      <SiGithub className="h-5 w-5" />
    </a>

    {/* LinkedIn profile */}
    <a
      href="https://www.linkedin.com/in/daniel-okafor"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-semibold transition hover:bg-muted"
    >
      in
    </a>

    {/* Email contact */}
    <a
      href="mailto:austzdee@hotmail.com"
      aria-label="Email"
      className="flex h-11 w-11 items-center justify-center rounded-lg border transition hover:bg-muted"
    >
      <Mail className="h-5 w-5" />
    </a>

  </div>
</div>

        {/* ============================================================
             Copyright
        ============================================================ */}
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          © {year} StockSync. All rights reserved.
        </div>
      </div>
    </div>
    </footer>
  );
};

export default LandingFooter;
