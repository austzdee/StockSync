interface ReportsChartProps {
  title: string;
  data: {
    name: string;
    value: number;
  }[];
}

const ReportsChart = ({ title, data }: ReportsChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-300">{item.name}</span>
              <span className="font-medium text-white">{item.value}</span>
            </div>

            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-amber-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsChart;