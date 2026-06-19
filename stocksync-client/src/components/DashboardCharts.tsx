import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  categoryData: ChartData[];
  warehouseData: ChartData[];
}

const CHART_COLORS = [
  "#f59e0b",
  "#06b6d4",
  "#22c55e",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const DashboardCharts = ({
  categoryData,
  warehouseData,
}: DashboardChartsProps) => {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Inventory by Category
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">
          Inventory by Warehouse
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={warehouseData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default DashboardCharts;