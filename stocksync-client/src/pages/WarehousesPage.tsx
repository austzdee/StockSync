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
  type WarehouseFormErrors,
  type WarehouseFormValues,
  validateWarehouseForm,
} from "@/lib/warehouseValidation";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
  type CreateWarehouseRequest,
  type Warehouse,
} from "@/services/warehouseService";

const emptyFormValues: WarehouseFormValues = {
  locationName: "",
  address: "",
};

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] =
    useState<WarehouseFormValues>(emptyFormValues);

  const [formErrors, setFormErrors] = useState<WarehouseFormErrors>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingWarehouseId, setDeletingWarehouseId] = useState<number | null>(
    null,
  );

  const isEditing = editingWarehouseId !== null;
  const isOperationPending = isSubmitting || deletingWarehouseId !== null;

  /**
   * Loads warehouse records from the backend API.
   */
  const loadWarehouses = async (
    showErrorNotification = true,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const data = await getWarehouses();

      const sortedWarehouses = [...data].sort((first, second) => {
        const locationComparison = first.locationName.localeCompare(
          second.locationName,
          "en-GB",
          {
            sensitivity: "base",
          },
        );

        if (locationComparison !== 0) {
          return locationComparison;
        }

        return first.address.localeCompare(second.address, "en-GB", {
          sensitivity: "base",
        });
      });

      setWarehouses(sortedWarehouses);

      return true;
    } catch (error) {
      console.error("Failed to load warehouses", error);

      if (showErrorNotification) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load warehouses. Please try again.",
          ),
        );
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  /**
   * Resets the form to its initial create-warehouse state.
   */
  const resetForm = () => {
    setFormData(emptyFormValues);
    setFormErrors({});
    setEditingWarehouseId(null);
  };

  /**
   * Updates one warehouse form field and clears its validation error.
   */
  const handleInputChange =
    (field: keyof WarehouseFormValues) =>
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
   * Loads the selected warehouse into the form for editing.
   */
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setFormData({
      locationName: warehouse.locationName,
      address: warehouse.address,
    });

    setFormErrors({});
    setEditingWarehouseId(warehouse.id);

    document.getElementById("warehouse-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /**
   * Creates a warehouse or updates the selected warehouse.
   */
  const handleSaveWarehouse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isOperationPending) {
      return;
    }

    const validationErrors = validateWarehouseForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);

      const firstInvalidField = Object.keys(validationErrors)[0] as
        | keyof WarehouseFormValues
        | undefined;

      if (firstInvalidField) {
        document
          .getElementById(`warehouse-${String(firstInvalidField)}`)
          ?.focus();
      }

      return;
    }

    const payload: CreateWarehouseRequest = {
      locationName: formData.locationName.trim(),
      address: formData.address.trim(),
    };

    setIsSubmitting(true);

    try {
      if (editingWarehouseId !== null) {
        await updateWarehouse(editingWarehouseId, payload);
      } else {
        await createWarehouse(payload);
      }

      const warehousesRefreshed = await loadWarehouses(false);

      resetForm();

      if (warehousesRefreshed) {
        toast.success(
          isEditing
            ? "Warehouse updated successfully."
            : "Warehouse created successfully.",
        );
      } else {
        toast.error(
          isEditing
            ? "Warehouse was updated, but the warehouse list could not be refreshed."
            : "Warehouse was created, but the warehouse list could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to save warehouse", error);

      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? "Unable to update the warehouse. Please try again."
            : "Unable to create the warehouse. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Deletes a warehouse after user confirmation.
   */
  const handleDeleteWarehouse = async (warehouse: Warehouse) => {
    if (isOperationPending) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${warehouse.locationName}"? This warehouse will be removed from active operations.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingWarehouseId(warehouse.id);

    try {
      await deleteWarehouse(warehouse.id);

      const warehousesRefreshed = await loadWarehouses(false);

      if (editingWarehouseId === warehouse.id) {
        resetForm();
      }

      if (warehousesRefreshed) {
        toast.success("Warehouse deleted successfully.");
      } else {
        toast.error(
          "Warehouse was deleted, but the warehouse list could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to delete warehouse", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to delete the warehouse. Please try again.",
        ),
      );
    } finally {
      setDeletingWarehouseId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Warehouses"
          description="Create, update and manage warehouse locations."
        />

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit warehouse" : "Add warehouse"}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the selected warehouse details below."
                : "Enter the details required to add a warehouse location."}
            </p>
          </CardHeader>

          <CardContent>
            <form
              id="warehouse-form"
              onSubmit={handleSaveWarehouse}
              noValidate
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <FormField
                id="warehouse-locationName"
                label="Location name"
                error={formErrors.locationName}
                hint={`${formData.locationName.length}/100 characters`}
                required
              >
                <Input
                  id="warehouse-locationName"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange("locationName")}
                  placeholder="Example: Manchester Central"
                  autoComplete="organization"
                  maxLength={100}
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.locationName)}
                  aria-describedby={
                    formErrors.locationName
                      ? "warehouse-locationName-error"
                      : "warehouse-locationName-hint"
                  }
                />
              </FormField>

              <FormField
                id="warehouse-address"
                label="Address"
                error={formErrors.address}
                hint={`${formData.address.length}/250 characters`}
                required
              >
                <Input
                  id="warehouse-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange("address")}
                  placeholder="Example: 10 Market Street, Manchester"
                  autoComplete="street-address"
                  maxLength={250}
                  disabled={isOperationPending}
                  required
                  aria-invalid={Boolean(formErrors.address)}
                  aria-describedby={
                    formErrors.address
                      ? "warehouse-address-error"
                      : "warehouse-address-hint"
                  }
                />
              </FormField>

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 px-5"
                  disabled={isOperationPending}
                >
                  {isSubmitting
                    ? isEditing
                      ? "Updating warehouse..."
                      : "Creating warehouse..."
                    : isEditing
                      ? "Update warehouse"
                      : "Add warehouse"}
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
              <CardTitle>Warehouse list</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {warehouses.length === 1
                  ? "1 warehouse"
                  : `${warehouses.length} warehouses`}
              </p>
            </div>
          </CardHeader>

          {isLoading ? (
            <LoadingState message="Loading warehouses..." />
          ) : warehouses.length === 0 ? (
            <EmptyState
              title="No warehouses available"
              description="Add your first warehouse using the form above."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <caption className="sr-only">Warehouse locations</caption>

                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Location
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Address
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className="border-t border-border transition hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {warehouse.locationName}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {warehouse.address}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditWarehouse(warehouse)}
                            disabled={isOperationPending}
                            aria-label={`Edit ${warehouse.locationName}`}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteWarehouse(warehouse)}
                            disabled={isOperationPending}
                            aria-label={`Delete ${warehouse.locationName}`}
                          >
                            {deletingWarehouseId === warehouse.id
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

export default WarehousesPage;
