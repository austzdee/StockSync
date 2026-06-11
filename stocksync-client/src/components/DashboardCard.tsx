interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}

/**
 * Reusable metric card used across the dashboard.
 * Keeps dashboard statistics consistent and easy to maintain.
 */
const DashboardCard = ({
  title,
  value,
  description,
  tone = "default",
}: DashboardCardProps) => {
  const valueColor = {
    default: "text-white",
    success: "text-green-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <p className="text-sm text-slate-400">{title}</p>

      <p className={`mt-3 text-3xl font-bold ${valueColor}`}>{value}</p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default DashboardCard;
