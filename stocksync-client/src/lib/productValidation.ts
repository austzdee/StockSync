export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  price: string;
}

export type ProductFormErrors = Partial<
  Record<keyof ProductFormValues, string>
>;

/**
 * Validates product form values before submission.
 */
export const validateProductForm = (
  values: ProductFormValues,
): ProductFormErrors => {
  const errors: ProductFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (!values.sku.trim()) {
    errors.sku = "SKU is required.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!values.price.trim()) {
    errors.price = "Price is required.";
  } else {
    const parsedPrice = Number(values.price);

    if (!Number.isFinite(parsedPrice)) {
      errors.price = "Enter a valid price.";
    } else if (parsedPrice < 0) {
      errors.price = "Price cannot be negative.";
    }
  }

  return errors;
};
