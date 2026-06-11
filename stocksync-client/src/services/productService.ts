import { api } from "./api";
import type { Product } from "../types/product";

/**
 * Retrieves all products from the API.
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");

  return response.data;
};