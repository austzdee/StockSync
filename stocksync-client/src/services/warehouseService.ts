import { api } from "./api";

export interface Warehouse {
  id: number;
  locationName: string;
  address: string;
}

export interface CreateWarehouseRequest {
  locationName: string;
  address: string;
}

/**
 * Retrieves warehouse records from the backend API.
 */
export const getWarehouses = async (): Promise<Warehouse[]> => {
  const response = await api.get<Warehouse[]>("/Warehouses");

  return response.data;
};

/**
 * Creates a new warehouse record.
 */
export const createWarehouse = async (
  warehouse: CreateWarehouseRequest
): Promise<Warehouse> => {
  const response = await api.post<Warehouse>("/Warehouses", warehouse);

  return response.data;
};

/**
 * Updates an existing warehouse record.
 */
export const updateWarehouse = async (
  id: number,
  warehouse: CreateWarehouseRequest
): Promise<Warehouse> => {
  const response = await api.put<Warehouse>(`/Warehouses/${id}`, warehouse);

  return response.data;
};

/**
 * Deletes an existing warehouse record.
 */
export const deleteWarehouse = async (id: number): Promise<void> => {
  await api.delete(`/Warehouses/${id}`);
};