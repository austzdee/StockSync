import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createProduct,
  getProducts,
  type CreateProductRequest,
  type Product,
} from "../services/productService";

const ProductsPage = () => {
  // Product data fetched from the API and displayed in the table.
  const [products, setProducts] = useState<Product[]>([]);

  // Loading state for initial data fetch.
  const [isLoading, setIsLoading] = useState(true);

  // Submission state to disable the form while saving a product.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local form state for the create product form.
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    sku: "",
    category: "",
    price: 0,
  });

  /**
   * Loads product records from the backend API.
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

  // Fetch products once when the page mounts.
  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Creates a new product, then refreshes the table.
   */
  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await createProduct(formData);
      await loadProducts();

      setFormData({
        name: "",
        sku: "",
        category: "",
        price: 0,
      });
    } catch (error) {
      console.error("Failed to create product", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Products</h1>

        <p className="mt-2 text-slate-400">Manage inventory products.</p>

        {/* Create product form */}
        <form
          onSubmit={handleCreateProduct}
          className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4"
        >
          <input
            type="text"
            placeholder="Product name"
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          />

          <input
            type="text"
            placeholder="SKU"
            value={formData.sku}
            onChange={(event) =>
              setFormData({ ...formData, sku: event.target.value })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(event) =>
              setFormData({
                ...formData,
                price: Number(event.target.value),
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
            min="0"
            step="0.01"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-4"
          >
            {isSubmitting ? "Creating Product..." : "Add Product"}
          </button>
        </form>

        {/* Products table container */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Product List</h2>
          </div>

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