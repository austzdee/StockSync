import DashboardLayout from "../layouts/DashboardLayout";

const StockTransfersPage = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white">
        Stock Transfers
      </h1>

      <p className="mt-2 text-slate-400">
        Manage stock transfers between warehouses.
      </p>
    </DashboardLayout>
  );
};

export default StockTransfersPage;
    