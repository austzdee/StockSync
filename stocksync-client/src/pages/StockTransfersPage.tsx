import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProducts, type Product } from "../services/productService";
import { getWarehouses, type Warehouse } from "../services/warehouseService";
import {
  assignStock,
  getStock,
  releaseStock,
  reserveStock,
  transferStock,
  type AssignStockRequest,
  type ReleaseStockRequest,
  type ReserveStockRequest,
  type StockItem,
  type TransferStockRequest,
} from "../services/stockService";

/**
 * Stock Operations page.
 * Provides inventory workflows for assigning and reserving stock.
 */
const StockTransfersPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Form state used when assigning stock to a warehouse.
   */
  const [formData, setFormData] = useState<AssignStockRequest>({
    productId: 0,
    warehouseId: 0,
    quantityAvailable: 0,
  });

  /**
   * Form state used when reserving stock from available inventory.
   */
  const [reserveData, setReserveData] = useState<ReserveStockRequest>({
    productId: 0,
    warehouseId: 0,
    quantity: 0,
  });

  /**
   * Stores release stock form values.
   */

  const [releaseData, setReleaseData] = useState<ReleaseStockRequest>({
    productId: 0,
    warehouseId: 0,
    quantity: 0,
  });

  /**
   * Transfer stock request payload.
   * Moves stock from one warehouse to another.
   */
  const [transferData, setTransferData] = useState<TransferStockRequest>({
    productId: 0,
    fromWarehouseId: 0,
    toWarehouseId: 0,
    quantity: 0,
  });

  /**
   * Loads products, warehouses, and stock records required by the page.
   */
  const loadStockPageData = async () => {
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
      console.error("Failed to load stock page data", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Assigns stock quantity to a selected product and warehouse.
   */
  const handleAssignStock = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsAssigning(true);

    try {
      await assignStock(formData);
      await loadStockPageData();

      setFormData({
        productId: 0,
        warehouseId: 0,
        quantityAvailable: 0,
      });
    } catch (error) {
      console.error("Failed to assign stock", error);
    } finally {
      setIsAssigning(false);
    }
  };

  /**
   * Reserves stock quantity from available stock.
   */
  const handleReserveStock = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsReserving(true);

    try {
      await reserveStock(reserveData);
      await loadStockPageData();

      setReserveData({
        productId: 0,
        warehouseId: 0,
        quantity: 0,
      });
    } catch (error) {
      console.error("Failed to reserve stock", error);
    } finally {
      setIsReserving(false);
    }
  };

  /**
   * Releases reserved stock back into available stock.
   */
  const handleReleaseStock = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsReleasing(true);

    try {
      await releaseStock(releaseData);
      await loadStockPageData();

      setReleaseData({
        productId: 0,
        warehouseId: 0,
        quantity: 0,
      });
    } catch (error) {
      console.error("Failed to release stock", error);
    } finally {
      setIsReleasing(false);
    }
  };

  /**
   * Transfers stock from one warehouse to another.
   */
  const handleTransferStock = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsTransferring(true);

    try {
      await transferStock(transferData);
      await loadStockPageData();

      setTransferData({
        productId: 0,
        fromWarehouseId: 0,
        toWarehouseId: 0,
        quantity: 0,
      });
    } catch (error) {
      console.error("Failed to transfer stock", error);
    } finally {
      setIsTransferring(false);
    }
  };

  /**
   * Loads stock operation data when the page first renders.
   */
  useEffect(() => {
    loadStockPageData();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Stock Operations</h1>

        <p className="mt-2 text-slate-400">
          Manage stock assignment, reservations and transfers.
        </p>

        {/* Assign Stock Form */}
        <form
          onSubmit={handleAssignStock}
          className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4"
        >
          <select
            value={formData.productId}
            onChange={(event) =>
              setFormData({
                ...formData,
                productId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          >
            <option value={0}>Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={formData.warehouseId}
            onChange={(event) =>
              setFormData({
                ...formData,
                warehouseId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          >
            <option value={0}>Select warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.locationName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={formData.quantityAvailable}
            onChange={(event) =>
              setFormData({
                ...formData,
                quantityAvailable: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            min="1"
            required
          />

          <button
            type="submit"
            disabled={isAssigning}
            className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAssigning ? "Assigning..." : "Assign Stock"}
          </button>
        </form>

        {/* Reserve Stock Form */}
        <form
          onSubmit={handleReserveStock}
          className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4"
        >
          <select
            value={reserveData.productId}
            onChange={(event) =>
              setReserveData({
                ...reserveData,
                productId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-amber-500"
            required
          >
            <option value={0}>Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={reserveData.warehouseId}
            onChange={(event) =>
              setReserveData({
                ...reserveData,
                warehouseId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-amber-500"
            required
          >
            <option value={0}>Select warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.locationName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Reserve quantity"
            value={reserveData.quantity}
            onChange={(event) =>
              setReserveData({
                ...reserveData,
                quantity: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-amber-500"
            min="1"
            required
          />

          <button
            type="submit"
            disabled={isReserving}
            className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReserving ? "Reserving..." : "Reserve Stock"}
          </button>
        </form>

        {/* Release Stock Form */}

        <form
          onSubmit={handleReleaseStock}
          className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4"
        >
          <select
            value={releaseData.productId}
            onChange={(event) =>
              setReleaseData({
                ...releaseData,
                productId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
            required
          >
            <option value={0}>Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={releaseData.warehouseId}
            onChange={(event) =>
              setReleaseData({
                ...releaseData,
                warehouseId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
            required
          >
            <option value={0}>Select warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.locationName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Release quantity"
            value={releaseData.quantity}
            onChange={(event) =>
              setReleaseData({
                ...releaseData,
                quantity: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
            min="1"
            required
          />

          <button
            type="submit"
            disabled={isReleasing}
            className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReleasing ? "Releasing..." : "Release Stock"}
          </button>
        </form>

        {/* Transfer Stock Form */}
        {/* Transfer Stock Form */}
        <form
          onSubmit={handleTransferStock}
          className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-5"
        >
          <select
            value={transferData.productId}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                productId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
            required
          >
            <option value={0}>Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>

          <select
            value={transferData.fromWarehouseId}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                fromWarehouseId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
            required
          >
            <option value={0}>From warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.locationName}
              </option>
            ))}
          </select>

          <select
            value={transferData.toWarehouseId}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                toWarehouseId: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
            required
          >
            <option value={0}>To warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.locationName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Transfer quantity"
            value={transferData.quantity}
            onChange={(event) =>
              setTransferData({
                ...transferData,
                quantity: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-purple-500"
            min="1"
            required
          />

          <button
            type="submit"
            disabled={isTransferring}
            className="rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTransferring ? "Transferring..." : "Transfer Stock"}
          </button>
        </form>

        {/* Stock Records Table */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Stock Records</h2>
          </div>

          {isLoading ? (
            <p className="p-6 text-slate-400">Loading stock records...</p>
          ) : stockItems.length === 0 ? (
            <p className="p-6 text-slate-400">No stock records found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Warehouse</th>
                  <th className="px-6 py-3">Available</th>
                  <th className="px-6 py-3">Reserved</th>
                  <th className="px-6 py-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {stockItems.map((item) => (
                  <tr
                    key={`${item.productId}-${item.warehouseId}`}
                    className="border-t border-slate-800"
                  >
                    <td className="px-6 py-4 text-white">{item.productName}</td>

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

export default StockTransfersPage;
