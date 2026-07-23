import {
  ArrowRight,
  BarChart3,
  PackagePlus,
  RefreshCcw,
} from "lucide-react";

/**
 * Defines the operational steps presented within
 * the StockSync workflow section.
 */
const workflowSteps = [
  {
    number: "01",
    title: "Set up your inventory network",
    description:
      "Create products, define warehouse locations and establish the structure required to manage inventory.",
    icon: PackagePlus,
  },
  {
    number: "02",
    title: "Control stock movement",
    description:
      "Assign, reserve, release and transfer stock through secure and validated operational workflows.",
    icon: RefreshCcw,
  },
  {
    number: "03",
    title: "Monitor performance",
    description:
      "Use reporting, valuation data and audit history to understand stock levels and make informed decisions.",
    icon: BarChart3,
  },
];

/**
 * Explains how users interact with StockSync
 * through a simple three-step operational workflow.
 */
const WorkflowSection = () => {
  return (
    <section
      id="how-it-works"
      className="border-y bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        {/* ============================================================
             Section Heading
        ============================================================ */}
        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A clear workflow from inventory setup to operational insight
          </h2>

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            StockSync brings product management, warehouse operations and
            reporting together within one connected platform.
          </p>

        </div>

        {/* ============================================================
             Workflow Steps
        ============================================================ */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">

          {workflowSteps.map(
            ({ number, title, description, icon: Icon }, index) => (
              <article
                key={number}
                className="relative rounded-2xl border bg-background p-7 shadow-sm"
              >

                {/* Step number and icon */}
                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-primary">
                    Step {number}
                  </span>

                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>

                </div>

                {/* Step content */}
                <h3 className="mt-7 text-xl font-semibold">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>

                {/* Displays a directional arrow between desktop steps. */}
                {index < workflowSteps.length - 1 && (
                  <div className="absolute -right-9 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <div className="flex size-12 items-center justify-center rounded-full border bg-background shadow-sm">
                      <ArrowRight
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                )}

              </article>
            ),
          )}

        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;