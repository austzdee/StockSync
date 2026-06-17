import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import ReportsChart from "../components/ReportsChart";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProducts, type Product } from "../services/productService";
import { getWarehouses, type Warehouse } from "../services/warehouseService";
import { getStock, type StockItem } from "../services/stockService";
import { getAuditLogs, type AuditLog } from "../services/auditService";

const ReportsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [productData, warehouseData, stockData, auditData] =
          await Promise.all([
            getProducts(),
            getWarehouses(),
            getStock(),
            getAuditLogs(),
          ]);

        setProducts(productData);
        setWarehouses(warehouseData);
        setStockItems(stockData.results);
        setAuditLogs(auditData);
      } catch (error) {
        console.error("Failed to load report data", error);
      }
    };

    loadReportData();
  }, []);

  const totalAvailableUnits = stockItems.reduce(
    (sum, item) => sum + item.quantityAvailable,
    0
  );

  const totalReservedUnits = stockItems.reduce(
    (sum, item) => sum + item.quantityReserved,
    0
  );

  const totalInventoryUnits = stockItems.reduce(
    (sum, item) => sum + item.totalQuantity,
    0
  );

  const lowStockItems = stockItems.filter((item) => item.totalQuantity < 10);

 const inventoryByProduct = Object.values(
  stockItems.reduce<Record<string, { name: string; value: number }>>(
    (result, item) => {
      const productName = item.productName;

      if (!result[productName]) {
        result[productName] = {
          name: productName,
          value: 0,
        };
      }

      result[productName].value += item.totalQuantity;

      return result;
    },
    {}
  )
);

  const inventoryByWarehouse = warehouses.map((warehouse) => {
    const warehouseStock = stockItems
      .filter((item) => item.warehouseId === warehouse.id)
      .reduce((sum, item) => sum + item.totalQuantity, 0);

    return {
      name: warehouse.locationName,
      value: warehouseStock,
    };
  });

  const getProductName = (productId: number) => {
    return (
      products.find((product) => product.id === productId)?.name ??
      `Product #${productId}`
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toUpperCase()) {
      case "ASSIGN":
        return "border-green-500/30 bg-green-500/10 text-green-400";
      case "RESERVE":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      case "RELEASE":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
      case "TRANSFER":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";
    }
  };

  const getStockStatus = (available: number) => {
    if (available <= 5) return "Critical";
    if (available <= 10) return "Low";
    return "Healthy";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>

            <p className="mt-2 text-slate-400">
              Inventory insights, stock risks and warehouse summaries.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">
              Export CSV
            </button>

            <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400">
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title="Total Products"
            value={products.length}
            description="Products currently tracked"
          />

          <DashboardCard
            title="Warehouses"
            value={warehouses.length}
            description="Active storage locations"
            tone="success"
          />

          <DashboardCard
            title="Available Units"
            value={totalAvailableUnits}
            description="Units available for allocation"
          />

          <DashboardCard
            title="Reserved Units"
            value={totalReservedUnits}
            description="Units currently reserved"
            tone="danger"
          />

          <DashboardCard
            title="Inventory Units"
            value={totalInventoryUnits}
            description="Total available and reserved units"
            tone="success"
          />

          <DashboardCard
            title="Low Stock Items"
            value={lowStockItems.length}
            description="Stock records below threshold"
            tone="warning"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="border-t border-slate-800">
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getActionBadgeClass(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {getProductName(log.productId)}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {log.quantityChanged}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {formatDate(log.createdAtUtc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="grid gap-8 xl:grid-cols-2">
          <ReportsChart
            title="Inventory by Product"
            data={inventoryByProduct}
          />

          <ReportsChart
            title="Inventory by Warehouse"
            data={inventoryByWarehouse}
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Low Stock Report
            </h2>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="p-6 text-slate-400">No low stock records found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Warehouse</th>
                  <th className="px-6 py-3">Available</th>
                  <th className="px-6 py-3">Reserved</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {lowStockItems.map((item) => (
                  <tr
                    key={`${item.productId}-${item.warehouseId}`}
                    className="border-t border-slate-800"
                  >
                    <td className="px-6 py-4 text-white">
                      {item.productName}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {item.warehouseName}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {item.quantityAvailable}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {item.quantityReserved}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {item.totalQuantity}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                        {getStockStatus(item.quantityAvailable)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;