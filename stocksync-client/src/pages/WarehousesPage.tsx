import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createWarehouse,
  getWarehouses,
  type CreateWarehouseRequest,
  type Warehouse,
} from "../services/warehouseService";

const WarehousesPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateWarehouseRequest>({
    locationName: "",
    address: "",
  });
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

  const handleCreateWarehouse = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await createWarehouse(formData);
      await loadWarehouses();

      setFormData({
        locationName: "",
        address: "",
      });
    } catch (error) {
      console.error("Failed to create warehouse", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Warehouses</h1>

        <p className="mt-2 text-slate-400">Manage warehouse locations.</p>

        <form
          onSubmit={handleCreateWarehouse}
          className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Location name"
            value={formData.locationName}
            onChange={(event) =>
              setFormData({
                ...formData,
                locationName: event.target.value,
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(event) =>
              setFormData({
                ...formData,
                address: event.target.value,
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {isSubmitting ? "Creating Warehouse..." : "Add Warehouse"}
          </button>
        </form>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Warehouse List</h2>
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
                  <tr key={warehouse.id} className="border-t border-slate-800">
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
