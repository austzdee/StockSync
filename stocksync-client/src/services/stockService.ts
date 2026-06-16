import { api } from "./api";

export interface StockItem {
  productId: number;
  productName: string;
  sku: string;
  category: string;
  warehouseId: number;
  warehouseName: string;
  quantityAvailable: number;
  quantityReserved: number;
  totalQuantity: number;
}

export interface StockResponse {
  totalCount: number;
  limit: number;
  offset: number;
  results: StockItem[];
}

export interface AssignStockRequest {
  productId: number;
  warehouseId: number;
  quantityAvailable: number;
}

export interface ReleaseStockRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export interface TransferStockRequest {
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: number;
}

/**
 * Retrieves stock records from the backend API.
 */
export const getStock = async (): Promise<StockResponse> => {
  const response = await api.get<StockResponse>(
    "/Stock?limit=100&offset=0"
  );

  return response.data;
};

/**
 * Assigns stock quantity to a product in a warehouse.
 */
export const assignStock = async (
  request: AssignStockRequest
): Promise<void> => {
  await api.post("/Stock/assign", request);
};

/**
 * Request payload used when reserving available stock.
 */
export interface ReserveStockRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
}

/**
 * Reserves stock for a product.
 */
export const reserveStock = async (
  request: ReserveStockRequest
): Promise<void> => {
  await api.post("/Stock/reserve", request);
};

/**
 * Releases reserved stock back into available stock.
 */
export const releaseStock = async (
  request: ReleaseStockRequest
): Promise<void> => {
  await api.post("/Stock/release", request);
};

/**
 * Transfers stock from one warehouse to another.
 */

export const transferStock = async (
  request: TransferStockRequest
): Promise<void> => {
  await api.post("/Stock/transfer", request);
};