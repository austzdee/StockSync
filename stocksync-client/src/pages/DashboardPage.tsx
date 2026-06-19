import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProducts, type Product } from "../services/productService";
import { getWarehouses, type Warehouse } from "../services/warehouseService";
import { getStock, type StockItem } from "../services/stockService";

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productData, warehouseData, stockData] = await Promise.all([
          getProducts(),
          getWarehouses(),
          getStock(),
        ]);

        setProducts(productData);
        setWarehouses(warehouseData);
        setStockItems(stockData.results);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
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

  const lowStockRecords = stockItems.filter((item) => item.totalQuantity < 10);

  const reservedStockPercentage =
    totalInventoryUnits === 0
      ? 0
      : Math.round((totalReservedUnits / totalInventoryUnits) * 100);

  const warehouseUtilization =
    warehouses.length === 0
      ? 0
      : Math.round(
          (stockItems.filter((item) => item.totalQuantity > 0).length /
            warehouses.length) *
            100
        );

  const inventoryByCategory = stockItems.reduce<Record<string, number>>(
    (result, item) => {
      result[item.category] = (result[item.category] ?? 0) + item.totalQuantity;
      return result;
    },
    {}
  );

  const inventoryByWarehouse = warehouses.map((warehouse) => {
    const totalQuantity = stockItems
      .filter((item) => item.warehouseId === warehouse.id)
      .reduce((sum, item) => sum + item.totalQuantity, 0);

    return {
      name: warehouse.locationName,
      value: totalQuantity,
    };
  });

  const topStockItems = [...stockItems]
    .sort((firstItem, secondItem) => secondItem.totalQuantity - firstItem.totalQuantity)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-stone-300">Stock</span>
            <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
              Sync
            </span>
            <span className="ml-3 text-white">Dashboard</span>
          </h1>

          <p className="mt-3 text-slate-400">
            Real-time inventory performance, stock risks and warehouse insights.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            Loading dashboard analytics...
          </div>
        ) : (
          <>
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
                description="Units available for sale or allocation"
              />

              <DashboardCard
                title="Reserved Units"
                value={totalReservedUnits}
                description={`${reservedStockPercentage}% of inventory reserved`}
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
                value={lowStockRecords.length}
                description="Stock records below threshold"
                tone="warning"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <AnalyticsPanel
                title="Inventory Health"
                description="Operational overview of current stock performance."
              >
                <AnalyticsMetric
                  label="Reserved Stock Ratio"
                  value={`${reservedStockPercentage}%`}
                />

                <AnalyticsMetric
                  label="Warehouse Utilization"
                  value={`${warehouseUtilization}%`}
                />

                <AnalyticsMetric
                  label="Low Stock Records"
                  value={lowStockRecords.length}
                />
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Top Stock Items"
                description="Highest quantity products across all warehouses."
              >
                <div className="space-y-3">
                  {topStockItems.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No stock records available.
                    </p>
                  ) : (
                    topStockItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.warehouseId}`}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.warehouseName}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-amber-400">
                          {item.totalQuantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Low Stock Watchlist"
                description="Items that may need replenishment soon."
              >
                <div className="space-y-3">
                  {lowStockRecords.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No low stock records found.
                    </p>
                  ) : (
                    lowStockRecords.slice(0, 5).map((item) => (
                      <div
                        key={`${item.productId}-${item.warehouseId}`}
                        className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.warehouseName}
                          </p>
                        </div>

                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                          {item.totalQuantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </AnalyticsPanel>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <SimpleBarChart
                title="Inventory by Category"
                data={Object.entries(inventoryByCategory).map(
                  ([name, value]) => ({
                    name,
                    value,
                  })
                )}
              />

              <SimpleBarChart
                title="Inventory by Warehouse"
                data={inventoryByWarehouse}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

interface AnalyticsPanelProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const AnalyticsPanel = ({
  title,
  description,
  children,
}: AnalyticsPanelProps) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <div className="mt-5">{children}</div>
    </section>
  );
};

interface AnalyticsMetricProps {
  label: string;
  value: string | number;
}

const AnalyticsMetric = ({ label, value }: AnalyticsMetricProps) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-b-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
};

interface SimpleBarChartProps {
  title: string;
  data: {
    name: string;
    value: number;
  }[];
}

const SimpleBarChart = ({ title, data }: SimpleBarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <div className="mt-5 space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-slate-400">No chart data available.</p>
        ) : (
          data.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between text-sm">
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
          ))
        )}
      </div>
    </section>
  );
};

export default DashboardPage;