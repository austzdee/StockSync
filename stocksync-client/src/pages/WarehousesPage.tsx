import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
  type CreateWarehouseRequest,
  type Warehouse,
} from "../services/warehouseService";

const WarehousesPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(
    null
  );
  const [deletingWarehouseId, setDeletingWarehouseId] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState<CreateWarehouseRequest>({
    locationName: "",
    address: "",
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Loads warehouse records from the backend API.
   */
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

  /**
   * Loads the selected warehouse into the form for editing.
   */
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setFormData({
      locationName: warehouse.locationName,
      address: warehouse.address,
    });

    setEditingWarehouseId(warehouse.id);
  };

  /**
   * Deletes a warehouse after user confirmation, then refreshes the table.
   */
  const handleDeleteWarehouse = async (warehouseId: number) => {
    if (!window.confirm("Delete this warehouse?")) {
      return;
    }

    setDeletingWarehouseId(warehouseId);

    try {
      await deleteWarehouse(warehouseId);
      await loadWarehouses();
    } catch (error) {
      console.error("Failed to delete warehouse", error);
    } finally {
      setDeletingWarehouseId(null);
    }
  };

  /**
   * Creates a new warehouse or updates an existing warehouse.
   */
  const handleSaveWarehouse = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      if (editingWarehouseId) {
        await updateWarehouse(editingWarehouseId, formData);
      } else {
        await createWarehouse(formData);
      }

      await loadWarehouses();

      setFormData({
        locationName: "",
        address: "",
      });

      setEditingWarehouseId(null);
    } catch (error) {
      console.error("Failed to save warehouse", error);
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
          onSubmit={handleSaveWarehouse}
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
            {isSubmitting
              ? editingWarehouseId
                ? "Updating Warehouse..."
                : "Creating Warehouse..."
              : editingWarehouseId
                ? "Update Warehouse"
                : "Add Warehouse"}
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
                  <th className="px-6 py-3">Actions</th>
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

                    <td className="flex gap-2 px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleEditWarehouse(warehouse)}
                        className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
                        disabled={deletingWarehouseId === warehouse.id}
                        className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingWarehouseId === warehouse.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
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