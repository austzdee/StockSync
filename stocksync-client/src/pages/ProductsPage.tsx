import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import EmptyState from "@/components/feedback/EmptyState";
import LoadingState from "@/components/feedback/LoadingState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  type ProductFormErrors,
  type ProductFormValues,
  validateProductForm,
} from "@/lib/productValidation";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type CreateProductRequest,
  type Product,
} from "@/services/productService";

const emptyFormValues: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  price: "",
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProductFormValues>(emptyFormValues);

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );

  const isEditing = editingProductId !== null;
  const isOperationPending = isSubmitting || deletingProductId !== null;

  /**
   * Loads product records from the backend API.
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

  useEffect(() => {
    let isActive = true;

    const loadInitialProducts = async (): Promise<void> => {
      try {
        const data = await getProducts();

        if (isActive) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products", error);

        if (isActive) {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to load products. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialProducts();

    return () => {
      isActive = false;
    };
  }, []);

  /**
   * Resets the form to its initial create-product state.
   */
  const resetForm = () => {
    setFormData(emptyFormValues);
    setFormErrors({});
    setEditingProductId(null);
  };

  /**
   * Updates a form value and removes its existing validation error.
   */
  const handleInputChange =
    (field: keyof ProductFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      setFormData((current) => ({
        ...current,
        [field]: value,
      }));

      setFormErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const updatedErrors = { ...current };
        delete updatedErrors[field];

        return updatedErrors;
      });
    };

  /**
   * Populates the form with an existing product for editing.
   */
  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
    });

    setFormErrors({});
    setEditingProductId(product.id);

    document.getElementById("product-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Creates a new product or updates an existing product.
   */
  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOperationPending) {
      return;
    }

    const validationErrors = validateProductForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);

      const firstInvalidField = Object.keys(validationErrors)[0] as
        | keyof ProductFormValues
        | undefined;

      if (firstInvalidField) {
        document
          .getElementById(`product-${String(firstInvalidField)}`)
          ?.focus();
      }

      return;
    }

    const payload: CreateProductRequest = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
    };

    setIsSubmitting(true);

    try {
      if (editingProductId !== null) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }

      const productsRefreshed = await loadProducts(false);

      resetForm();

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
  const handleDeleteProduct = async (product: Product) => {
    if (isOperationPending) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      await deleteProduct(product.id);

      const productsRefreshed = await loadProducts(false);

      if (editingProductId === product.id) {
        resetForm();
      }

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
      <div className="space-y-8">
        <PageHeader
          title="Products"
          description="Create, update and manage inventory products."
        />

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit product" : "Add product"}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the selected product details below."
                : "Enter the details required to add a product to the catalogue."}
            </p>
          </CardHeader>

          <CardContent>
            <form
              id="product-form"
              onSubmit={handleProductSubmit}
              noValidate
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
              <FormField
                id="product-name"
                label="Product name"
                error={formErrors.name}
                required
              >
                <Input
                  id="product-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Example: Wireless keyboard"
                  autoComplete="off"
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={
                    formErrors.name ? "product-name-error" : undefined
                  }
                />
              </FormField>

              <FormField
                id="product-sku"
                label="SKU"
                error={formErrors.sku}
                required
              >
                <Input
                  id="product-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange("sku")}
                  placeholder="Example: KB-1001"
                  autoComplete="off"
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.sku)}
                  aria-describedby={
                    formErrors.sku ? "product-sku-error" : undefined
                  }
                />
              </FormField>

              <FormField
                id="product-category"
                label="Category"
                error={formErrors.category}
                required
              >
                <Input
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  placeholder="Example: Accessories"
                  autoComplete="off"
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.category)}
                  aria-describedby={
                    formErrors.category ? "product-category-error" : undefined
                  }
                />
              </FormField>

              <FormField
                id="product-price"
                label="Price"
                error={formErrors.price}
                hint="Enter the unit price in pounds sterling."
                required
              >
                <Input
                  id="product-price"
                  name="price"
                  type="number"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={handleInputChange("price")}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.price)}
                  aria-describedby={
                    formErrors.price
                      ? "product-price-error"
                      : "product-price-hint"
                  }
                />
              </FormField>

              <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row xl:col-span-4">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 px-5"
                  disabled={isOperationPending}
                >
                  {isSubmitting
                    ? isEditing
                      ? "Updating product..."
                      : "Creating product..."
                    : isEditing
                      ? "Update product"
                      : "Add product"}
                </Button>

                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 px-5"
                    onClick={resetForm}
                    disabled={isOperationPending}
                  >
                    Cancel editing
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Product list</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {products.length === 1
                  ? "1 product"
                  : `${products.length} products`}
              </p>
            </div>
          </CardHeader>

          {isLoading ? (
            <LoadingState message="Loading products..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products available"
              description="Add your first product using the form above."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left text-sm">
                <caption className="sr-only">Inventory products</caption>

                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Name
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      SKU
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Category
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Price
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-border transition hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {product.name}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        £{product.price.toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditClick(product)}
                            disabled={isOperationPending}
                            aria-label={`Edit ${product.name}`}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={isOperationPending}
                            aria-label={`Delete ${product.name}`}
                          >
                            {deletingProductId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
