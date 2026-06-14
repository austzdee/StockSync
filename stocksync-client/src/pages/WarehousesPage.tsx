import DashboardLayout from "../layouts/DashboardLayout";

const WarehousesPage = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white">
        Warehouses
      </h1>

      <p className="mt-2 text-slate-400">
        Manage warehouse locations.
      </p>
    </DashboardLayout>
  );
};

export default WarehousesPage;