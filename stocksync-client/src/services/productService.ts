import { api } from "./api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
}

/**
 * Retrieves products from the backend API.
 * The query parameters align with the ASP.NET Core Products endpoint.
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    "/Products?lowStock=false&limit=100&offset=0"
  );

  return response.data;
};