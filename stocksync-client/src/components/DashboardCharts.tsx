import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "@/components/feedback/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  categoryData: ChartData[];
  warehouseData: ChartData[];
}

const chartColours = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipContentStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
};

const tooltipItemStyle = {
  color: "var(--popover-foreground)",
};

const axisTickStyle = {
  fill: "var(--muted-foreground)",
  fontSize: 12,
};

const hasInventoryData = (data: ChartData[]) =>
  data.some((item) => item.value > 0);

const DashboardCharts = ({
  categoryData,
  warehouseData,
}: DashboardChartsProps) => {
  const categoryTitleId = useId();
  const warehouseTitleId = useId();

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Card aria-labelledby={categoryTitleId}>
        <CardHeader>
          <CardTitle id={categoryTitleId}>Inventory by category</CardTitle>
        </CardHeader>

        {!hasInventoryData(categoryData) ? (
          <EmptyState
            title="No category data available"
            description="Inventory category totals will appear when stock records are available."
          />
        ) : (
          <CardContent>
            <ul className="sr-only">
              {categoryData.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.value.toLocaleString("en-GB")} units
                </li>
              ))}
            </ul>

            <div
              className="h-80"
              role="img"
              aria-label="Pie chart showing inventory units by product category"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={chartColours[index % chartColours.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    itemStyle={tooltipItemStyle}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      color: "var(--muted-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        )}
      </Card>

      <Card aria-labelledby={warehouseTitleId}>
        <CardHeader>
          <CardTitle id={warehouseTitleId}>Inventory by warehouse</CardTitle>
        </CardHeader>

        {!hasInventoryData(warehouseData) ? (
          <EmptyState
            title="No warehouse data available"
            description="Warehouse inventory totals will appear when stock records are available."
          />
        ) : (
          <CardContent>
            <ul className="sr-only">
              {warehouseData.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.value.toLocaleString("en-GB")} units
                </li>
              ))}
            </ul>

            <div className="max-h-128 overflow-y-auto">
              <div
                style={{
                  height: `${Math.max(320, warehouseData.length * 52)}px`,
                }}
                role="img"
                aria-label="Bar chart showing inventory units by warehouse"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={warehouseData}
                    layout="vertical"
                    margin={{
                      top: 8,
                      right: 24,
                      bottom: 8,
                      left: 16,
                    }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={axisTickStyle}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                      allowDecimals={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={140}
                      interval={0}
                      tick={axisTickStyle}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={{ stroke: "var(--border)" }}
                      tickFormatter={(value: string) =>
                        value.length > 20 ? `${value.slice(0, 18)}…` : value
                      }
                    />

                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      itemStyle={tooltipItemStyle}
                      cursor={{ fill: "var(--muted)" }}
                    />

                    <Bar
                      dataKey="value"
                      name="Inventory units"
                      fill="var(--chart-3)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DashboardCharts;
