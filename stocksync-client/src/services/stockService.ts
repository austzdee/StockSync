import { api } from "./api";

export interface StockItem {
  productId: number;
  warehouseId: number;
  productName: string;
  warehouseName: string;
  quantityAvailable: number;
  quantityReserved: number;
}

export interface AssignStockRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
}

/**
 * Retrieves stock records from the backend API.
 */
export const getStock = async (): Promise<StockItem[]> => {
  const response = await api.get<StockItem[]>("/Stock");

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