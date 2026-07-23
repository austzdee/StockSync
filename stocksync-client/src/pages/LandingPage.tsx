import {
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TrustSection from "@/components/landing/TrustSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * Defines the core capabilities displayed within the
 * platform features section of the landing page.
 *
 * Each object represents a reusable feature card.
 */
const features = [
  {
    title: "Inventory visibility",
    description:
      "Track available and reserved stock across your complete product catalogue.",
    icon: Boxes,
  },
  {
    title: "Warehouse management",
    description:
      "Manage warehouse locations and understand how inventory is distributed.",
    icon: Building2,
  },
  {
    title: "Operational reporting",
    description:
      "Use inventory summaries, low-stock reports and valuation data to make informed decisions.",
    icon: BarChart3,
  },
  {
    title: "Secure workflows",
    description:
      "Protect sensitive inventory operations with authentication, authorization and audit history.",
    icon: ShieldCheck,
  },
];

/**
 * Landing page for the StockSync platform.
 *
 * This page introduces visitors to the application,
 * highlights its capabilities, and encourages users
 * to sign in and begin using the platform.
 */
const LandingPage = () => {
  /**
   * Enables programmatic navigation between routes.
   */
  const navigate = useNavigate();

  return (
    <>
      {/* ============================================================
           Hero Section
           ------------------------------------------------------------
           Introduces the platform with a marketing headline,
           call-to-action buttons and a dashboard preview.
      ============================================================ */}
      <section className="relative overflow-hidden border-b">

        {/* Decorative radial background used to add visual depth. */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-primary)/0.12,transparent_42%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8 lg:py-32">

          {/* ========================================================
               Hero Content
          ======================================================== */}
          <div>

            {/* Marketing badge */}
            <div className="mb-6 inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm">
              Modern inventory operations from one platform
            </div>

            {/* Main marketing headline */}
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Smarter inventory management starts here.
            </h1>

            {/* Supporting description */}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Track products, manage warehouses, control stock movement and
              gain actionable operational insight through one secure,
              cloud-based platform.
            </p>

            {/* Primary call-to-action buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              {/* Redirects users to the login page */}
              <Button
                size="lg"
                onClick={() => navigate("/login")}
              >
                Get started
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>

              {/* Allows existing users to sign in */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Sign in to dashboard
              </Button>

            </div>

            {/* Platform highlights */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span>Multi-warehouse support</span>
              <span>Secure stock workflows</span>
              <span>Real-time reporting</span>
            </div>

          </div>

          {/* ========================================================
               Dashboard Preview
               Demonstrates how the application looks once signed in.
          ======================================================== */}
          <div className="rounded-3xl border bg-card p-3 shadow-2xl shadow-black/10">

            <div className="rounded-2xl border bg-muted/40 p-5">

              {/* Dashboard header */}
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Inventory overview
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Operations dashboard
                  </h2>
                </div>

                {/* System health badge */}
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                  Systems healthy
                </span>

              </div>

              {/* Dashboard KPI cards */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <PreviewMetric label="Products" value="248" />
                <PreviewMetric label="Warehouses" value="8" />
                <PreviewMetric label="Available units" value="12,480" />
                <PreviewMetric label="Low-stock items" value="14" warning />
              </div>

              {/* Warehouse distribution preview */}
              <div className="mt-4 rounded-xl border bg-background p-4">

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Warehouse distribution
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Live overview
                  </p>
                </div>

                {/* Sample warehouse distribution bars */}
                <div className="mt-5 space-y-4">
                  <DistributionBar
                    label="Manchester"
                    percentage={82}
                  />

                  <DistributionBar
                    label="Birmingham"
                    percentage={61}
                  />

                  <DistributionBar
                    label="London"
                    percentage={47}
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
           Trust Section
           Reinforces platform credibility using key metrics.
      ============================================================ */}
      <TrustSection />

      {/* ============================================================
           Features Section
           Presents the platform's primary capabilities.
      ============================================================ */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >

        {/* Section heading */}
        <div className="max-w-2xl">

          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Platform capabilities
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything required to keep inventory under control
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">
            StockSync combines daily inventory workflows with reporting,
            security and operational visibility.
          </p>

        </div>

        {/* Feature card grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {features.map(({ title, description, icon: Icon }) => (

            <article
              key={title}
              className="rounded-2xl border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >

              {/* Feature icon */}
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>

              {/* Feature title */}
              <h3 className="mt-5 font-semibold">
                {title}
              </h3>

              {/* Feature description */}
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>

            </article>

          ))}

        </div>

      </section>
      {/* ============================================================
     Workflow Section
     Explains how users operate the StockSync platform.
============================================================ */}
<WorkflowSection />
{/* ============================================================
     Final Call-to-Action Section
     Encourages visitors to enter the StockSync platform.
============================================================ */}
<CTASection />

{/* ============================================================
     Landing Footer
     Provides platform links, technology details,
     contact options and project attribution.
============================================================ */}
<LandingFooter />
    </>
  );
};

/**
 * Represents a dashboard KPI card displayed
 * within the dashboard preview.
 */
interface PreviewMetricProps {
  label: string;
  value: string;
  warning?: boolean;
}

/**
 * Displays a single dashboard metric.
 *
 * Warning metrics are highlighted using
 * an amber accent colour.
 */
const PreviewMetric = ({
  label,
  value,
  warning = false,
}: PreviewMetricProps) => {
  return (
    <div className="rounded-xl border bg-background p-4">

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          warning ? "text-amber-600" : ""
        }`}
      >
        {value}
      </p>

    </div>
  );
};

/**
 * Represents the properties required
 * to render a warehouse distribution bar.
 */
interface DistributionBarProps {
  label: string;
  percentage: number;
}

/**
 * Displays a visual progress bar representing
 * warehouse inventory distribution.
 */
const DistributionBar = ({
  label,
  percentage,
}: DistributionBarProps) => {
  return (
    <div>

      {/* Warehouse name and percentage */}
      <div className="mb-2 flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
};

export default LandingPage;