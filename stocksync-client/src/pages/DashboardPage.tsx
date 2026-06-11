import DashboardCard from "../components/DashboardCard";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-stone-300">Stock</span>
          <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
            Sync
          </span>

          <span className="ml-2 text-white">Dashboard</span>
        </h1>

        <p className="mt-2 text-slate-400">Inventory Management Platform</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Products"
            value={0}
            description="Products currently tracked"
          />

          <DashboardCard
            title="Warehouses"
            value={0}
            description="Active storage locations"
            tone="success"
          />

          <DashboardCard
            title="Low Stock Items"
            value={0}
            description="Items below threshold"
            tone="warning"
          />

          <DashboardCard
            title="Reserved Stock"
            value={0}
            description="Units currently reserved"
            tone="danger"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
