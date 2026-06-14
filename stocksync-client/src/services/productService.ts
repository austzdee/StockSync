import { api } from "./api";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
}

/**
 * Request payload used when creating a new product.
 */
export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  price: number;
}

/**
 * Retrieves products from the backend API.
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    "/Products?lowStock=false&limit=100&offset=0"
  );

  return response.data;
};

/**
 * Creates a new product record.
 */
export const createProduct = async (
  product: CreateProductRequest
): Promise<Product> => {
  const response = await api.post<Product>("/Products", product);

  return response.data;
};

/**
 * Updates an existing product record.
 */
export const updateProduct = async (
  id: number,
  product: CreateProductRequest
): Promise<Product> => {
  const response = await api.put<Product>(`/Products/${id}`, product);

  return response.data;
};

/**
 * Deletes an existing product record.
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/Products/${id}`);
};