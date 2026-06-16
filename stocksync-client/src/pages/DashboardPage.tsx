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

  const lowStockItems = stockItems.filter(
    (item) => item.totalQuantity < 10
  ).length;

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-stone-300">Stock</span>
          <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
            Sync
          </span>
          <span className="ml-3 text-white">Dashboard</span>
        </h1>

        <p className="mt-3 text-slate-400">Inventory Management Platform</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            description="Units reserved for pending orders"
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
            value={lowStockItems}
            description="Stock records below threshold"
            tone="warning"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;