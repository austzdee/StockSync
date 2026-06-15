import DashboardLayout from "../layouts/DashboardLayout";

// Page: Stock Transfers — UI surface for assigning, reserving and transferring stock between warehouses.
const StockTransfersPage = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">
          Stock Operations
        </h1>

        <p className="mt-2 text-slate-400">
          Manage stock assignment, reservations and transfers.
        </p>

        {/* Container: stock operations overview and controls (placeholders) */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            Stock Management
          </h2>

          <p className="mt-3 text-slate-400">
            Stock operations will appear here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockTransfersPage;