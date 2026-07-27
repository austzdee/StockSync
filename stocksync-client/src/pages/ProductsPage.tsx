import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type CreateProductRequest,
  type Product,
} from "../services/productService";

const ProductsPage = () => {
  // ID of the product currently being edited; null means create mode.
  const [editingProductId , setEditingProductId] = useState<number | null>(null);

  // Product list loaded from the API and shown in the table.
  const [products, setProducts] = useState<Product[]>([]);

  // Tracks whether the initial products load is still in progress.
  const [isLoading, setIsLoading] = useState(true);

  // Disables the create/update form while the request is pending.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Indicates which product is currently being deleted.
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );

  // Form state used for both create and edit operations.
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    sku: "",
    category: "",
    price: 0,
  });

  /**
   * Loads product records from the backend API.
   *
   * When manually refreshed after another operation, the function can
   * suppress duplicate error notifications and allow the calling action
   * to control the user-feedback flow.
   */
  const loadProducts = async (
    showErrorNotification = true,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const data = await getProducts();
      setProducts(data);
      return true;
    } catch (error) {
      console.error("Failed to load products", error);

      if (showErrorNotification) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load products. Please try again.",
          ),
        );
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    // Populate the form with the selected product so the user can update it.
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
    });

    setEditingProductId(product.id);
  };

  // Load products once when the component mounts.
  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Creates a new product or updates an existing product.
   *
   * The form remains disabled while the request is running to prevent
   * accidental duplicate submissions.
   */
  const handleProductSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting || deletingProductId !== null) {
      return;
    }

    const isEditing = editingProductId !== null;

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateProduct(editingProductId, formData);
      } else {
        await createProduct(formData);
      }

      const productsRefreshed = await loadProducts(false);

      setFormData({
        name: "",
        sku: "",
        category: "",
        price: 0,
      });

      setEditingProductId(null);

      if (productsRefreshed) {
        toast.success(
          isEditing
            ? "Product updated successfully."
            : "Product created successfully.",
        );
      } else {
        toast.error(
          isEditing
            ? "Product was updated, but the product list could not be refreshed."
            : "Product was created, but the product list could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to save product", error);

      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Unable to update the product. Please try again."
            : "Unable to create the product. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deletes a product after receiving confirmation from the user.
   */
  const handleDeleteProduct = async (productId: number) => {
    if (deletingProductId !== null || isSubmitting) {
      return;
    }

    if (!window.confirm("Delete this product? This action cannot be undone.")) {
      return;
    }

    setDeletingProductId(productId);

    try {
      await deleteProduct(productId);

      const productsRefreshed = await loadProducts(false);

      if (productsRefreshed) {
        toast.success("Product deleted successfully.");
      } else {
        toast.error(
          "Product was deleted, but the product list could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to delete product", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete the product. It may still be linked to stock records.",
        ),
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">Products</h1>

        <p className="mt-2 text-slate-400">Manage inventory products.</p>

        {/* Create product form */}
        <form
          onSubmit={handleProductSubmit}
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
            disabled={isSubmitting || deletingProductId !== null}
            className="rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-4"
          >
            {isSubmitting
               ? editingProductId !== null
                ? "Updating Product..."
                : "Creating Product..."
              : editingProductId !== null
                ? "Update Product"
                : "Add Product"}
          </button>
        </form>

        {/* Products table container */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Product List</h2>
          </div>

          {isLoading ? (
            <div
              className="flex items-center gap-3 p-6 text-slate-400"
              role="status"
              aria-live="polite"
            >
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400"
                aria-hidden="true"
              />
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="font-semibold text-white">
                No products available
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Add your first product using the form above.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Actions</th>
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
                    {/* Edit and delete actions for each product row */}
                    <td className="flex gap-2 px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleEditClick(product)}
                        disabled={isSubmitting || deletingProductId !== null}
                        className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId !== null || isSubmitting}
                        className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingProductId === product.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
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
