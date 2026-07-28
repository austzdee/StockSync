export interface WarehouseFormValues {
  locationName: string;
  address: string;
}

export type WarehouseFormErrors = Partial<
  Record<keyof WarehouseFormValues, string>
>;

/**
 * Validates warehouse form values against the backend DTO constraints.
 */
export const validateWarehouseForm = (
  values: WarehouseFormValues,
): WarehouseFormErrors => {
  const errors: WarehouseFormErrors = {};

  const locationName = values.locationName.trim();
  const address = values.address.trim();

  if (!locationName) {
    errors.locationName = "Location name is required.";
  } else if (locationName.length > 100) {
    errors.locationName =
      "Location name cannot exceed 100 characters.";
  }

  if (!address) {
    errors.address = "Address is required.";
  } else if (address.length > 250) {
    errors.address = "Address cannot exceed 250 characters.";
  }

  return errors;
};