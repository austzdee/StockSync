import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Displays the final call-to-action section on the landing page.
 *
 * This section encourages visitors to enter the application after
 * reviewing the platform's features and operational workflow.
 */
const CTASection = () => {
  /**
   * Enables navigation to the StockSync authentication page.
   */
  const navigate = useNavigate();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ============================================================
             Call-to-Action Container
             Provides a strong visual conclusion to the landing page.
        ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl border bg-foreground px-6 py-14 text-background shadow-xl sm:px-10 lg:px-16 lg:py-16">

          {/* Decorative background elements add depth without
              interfering with the CTA content. */}
          <div
            className="absolute -right-20 -top-24 size-72 rounded-full bg-background/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-28 -left-20 size-72 rounded-full bg-background/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

            {/* ========================================================
                 CTA Content
            ======================================================== */}
            <div className="max-w-2xl">

              {/* Supporting badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-sm text-background/80">
                <ShieldCheck
                  className="size-4"
                  aria-hidden="true"
                />
                Secure inventory operations
              </div>

              {/* Primary CTA heading */}
              <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                Bring your inventory operations into one connected platform.
              </h2>

              {/* Supporting CTA description */}
              <p className="mt-4 max-w-xl text-base leading-7 text-background/70 sm:text-lg">
                Access products, warehouses, stock workflows, reporting and
                audit history through a secure and modern management system.
              </p>

            </div>

            {/* ========================================================
                 CTA Actions
            ======================================================== */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">

              {/* Primary action for entering the platform */}
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/login")}
              >
                Get started
                <ArrowRight
                  className="ml-2 size-4"
                  aria-hidden="true"
                />
              </Button>

              {/* Secondary action for existing users */}
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTASection;