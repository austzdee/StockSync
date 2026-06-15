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