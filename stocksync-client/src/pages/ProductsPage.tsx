import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProducts, type Product } from "../services/productService";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Loads product records from the backend API when the page opens.
     * This keeps API access out of the JSX and makes the component easier to maintain.
     */
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Products</h1>

        <p className="mt-2 text-slate-400">Manage inventory products.</p>

        {/* Products table container */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Product List</h2>
          </div>

          {/* Loading and empty states improve user feedback during API requests. */}
          {isLoading ? (
            <p className="p-6 text-slate-400">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-slate-400">No products found.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-800">
                    <td className="px-6 py-4 text-white">{product.name}</td>
                    <td className="px-6 py-4 text-slate-300">{product.sku}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      £{product.price.toFixed(2)}
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

export default ProductsPage;