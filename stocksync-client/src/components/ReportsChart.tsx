import { useId } from "react";

import EmptyState from "@/components/feedback/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportsChartProps {
  title: string;
  data: {
    name: string;
    value: number;
  }[];
}

const ReportsChart = ({ title, data }: ReportsChartProps) => {
  const titleId = useId();
  const hasData = data.some((item) => item.value > 0);
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId}>{title}</CardTitle>
      </CardHeader>

      {!hasData ? (
        <EmptyState
          title="No chart data available"
          description="No inventory quantities match the current filters."
        />
      ) : (
        <CardContent>
          <ul className="sr-only">
            {data.map((item) => (
              <li key={item.name}>
                {item.name}: {item.value.toLocaleString("en-GB")} units
              </li>
            ))}
          </ul>

          <div className="space-y-4" aria-hidden="true">
            {data.map((item) => (
              <div key={item.name}>
                <div className="mb-1.5 flex justify-between gap-4 text-sm">
                  <span className="truncate text-muted-foreground">
                    {item.name}
                  </span>

                  <span className="font-medium tabular-nums text-foreground">
                    {item.value.toLocaleString("en-GB")}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ReportsChart;