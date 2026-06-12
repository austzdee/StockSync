import { api } from "./api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
}

/**
 * Retrieves all products.
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/Products");
  return response.data;
};