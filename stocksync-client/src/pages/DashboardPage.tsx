import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">
          StockSync Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Inventory Management Platform
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;