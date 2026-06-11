/**
 * Product entity returned from the API.
 */
export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
}