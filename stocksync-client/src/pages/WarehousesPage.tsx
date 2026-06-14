import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getWarehouses,
  type Warehouse,
} from "../services/warehouseService";

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWarehouses = async () => {
    try {
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to load warehouses", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Warehouses</h1>

        <p className="mt-2 text-slate-400">
          Manage warehouse locations.
        </p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Warehouse List
            </h2>
          </div>

          {isLoading ? (
            <p className="p-6 text-slate-400">Loading warehouses...</p>
          ) : warehouses.length === 0 ? (
            <p className="p-6 text-slate-400">No warehouses found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Address</th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((warehouse) => (
                  <tr
                    key={warehouse.id}
                    className="border-t border-slate-800"
                  >
                    <td className="px-6 py-4 text-white">
                      {warehouse.locationName}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {warehouse.address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WarehousesPage;