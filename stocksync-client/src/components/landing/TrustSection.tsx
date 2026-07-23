import { Building2, Boxes, PackageCheck, ShieldCheck } from "lucide-react";

/**
 * Displays platform highlights beneath the hero section.
 *
 * These metrics reinforce the platform's capabilities and
 * provide visitors with a quick overview.
 */
const metrics = [
  {
    icon: Boxes,
    value: "10,000+",
    label: "Products Managed",
  },
  {
    icon: Building2,
    value: "250+",
    label: "Warehouses",
  },
  {
    icon: PackageCheck,
    value: "50k+",
    label: "Stock Transactions",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "Platform Availability",
  },
];

const TrustSection = () => {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Trusted Platform
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Built for modern inventory operations
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            StockSync provides the visibility, reporting and secure workflows
            organisations need to manage inventory efficiently.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border bg-background p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-3xl font-bold">
                {value}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;