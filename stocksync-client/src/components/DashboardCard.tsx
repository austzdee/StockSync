import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClasses = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

/**
 * Displays one inventory metric using the shared card system.
 */
const DashboardCard = ({
  title,
  value,
  description,
  tone = "default",
}: DashboardCardProps) => {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString("en-GB") : value;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          {title}
        </h2>

        <p
          className={`mt-3 text-3xl font-bold tracking-tight ${toneClasses[tone]}`}
        >
          {formattedValue}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;