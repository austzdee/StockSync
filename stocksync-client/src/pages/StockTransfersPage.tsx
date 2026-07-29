import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import EmptyState from "@/components/feedback/EmptyState";
import LoadingState from "@/components/feedback/LoadingState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import {
  type AssignStockFormErrors,
  type AssignStockFormValues,
  type ReleaseStockFormErrors,
  type ReleaseStockFormValues,
  type ReserveStockFormErrors,
  type ReserveStockFormValues,
  type TransferStockFormErrors,
  type TransferStockFormValues,
  validateAssignStockForm,
  validateReleaseStockForm,
  validateReserveStockForm,
  validateTransferStockForm,
} from "@/lib/stockValidation";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getProducts, type Product } from "@/services/productService";
import {
  assignStock,
  getStock,
  releaseStock,
  reserveStock,
  transferStock,
  type AssignStockRequest,
  type ReleaseStockRequest,
  type ReserveStockRequest,
  type StockItem,
  type TransferStockRequest,
} from "@/services/stockService";
import { getWarehouses, type Warehouse } from "@/services/warehouseService";

type PendingOperation = "assign" | "reserve" | "release" | "transfer" | null;

const emptyAssignValues: AssignStockFormValues = {
  productId: "",
  warehouseId: "",
  quantityAvailable: "",
};

const emptyReserveValues: ReserveStockFormValues = {
  productId: "",
  warehouseId: "",
  quantity: "",
};

const emptyReleaseValues: ReleaseStockFormValues = {
  productId: "",
  warehouseId: "",
  quantity: "",
};

const emptyTransferValues: TransferStockFormValues = {
  productId: "",
  fromWarehouseId: "",
  toWarehouseId: "",
  quantity: "",
};

/**
 * Stock Operations page.
 * Provides accessible workflows for assigning, reserving,
 * releasing and transferring inventory.
 */
const StockTransfersPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const [assignData, setAssignData] =
    useState<AssignStockFormValues>(emptyAssignValues);

  const [reserveData, setReserveData] =
    useState<ReserveStockFormValues>(emptyReserveValues);

  const [releaseData, setReleaseData] =
    useState<ReleaseStockFormValues>(emptyReleaseValues);

  const [transferData, setTransferData] =
    useState<TransferStockFormValues>(emptyTransferValues);

  const [assignErrors, setAssignErrors] = useState<AssignStockFormErrors>({});

  const [reserveErrors, setReserveErrors] = useState<ReserveStockFormErrors>(
    {},
  );

  const [releaseErrors, setReleaseErrors] = useState<ReleaseStockFormErrors>(
    {},
  );

  const [transferErrors, setTransferErrors] = useState<TransferStockFormErrors>(
    {},
  );

  const [isLoading, setIsLoading] = useState(true);

  const [pendingOperation, setPendingOperation] =
    useState<PendingOperation>(null);

  /*
   * The synchronous lock prevents two form submissions from starting
   * before React has applied the pending-operation state update.
   */
  const operationLockRef = useRef(false);

  const isOperationPending = pendingOperation !== null;

  const areFormsDisabled =
    isLoading ||
    isOperationPending ||
    products.length === 0 ||
    warehouses.length === 0;

  /**
   * Loads and sorts the product, warehouse and stock data used by the page.
   */
  const loadStockPageData = async (
    showErrorNotification = true,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const [productData, warehouseData, stockData] = await Promise.all([
        getProducts(),
        getWarehouses(),
        getStock(),
      ]);

      const sortedProducts = [...productData].sort((first, second) => {
        const nameComparison = first.name.localeCompare(second.name, "en-GB", {
          sensitivity: "base",
        });

        if (nameComparison !== 0) {
          return nameComparison;
        }

        return first.sku.localeCompare(second.sku, "en-GB", {
          sensitivity: "base",
        });
      });

      const sortedWarehouses = [...warehouseData].sort((first, second) => {
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

      const sortedStockItems = [...stockData.results].sort((first, second) => {
        const productComparison = first.productName.localeCompare(
          second.productName,
          "en-GB",
          {
            sensitivity: "base",
          },
        );

        if (productComparison !== 0) {
          return productComparison;
        }

        return first.warehouseName.localeCompare(
          second.warehouseName,
          "en-GB",
          {
            sensitivity: "base",
          },
        );
      });

      setProducts(sortedProducts);
      setWarehouses(sortedWarehouses);
      setStockItems(sortedStockItems);

      return true;
    } catch (error) {
      console.error("Failed to load stock page data", error);

      if (showErrorNotification) {
        toast.error(
          getApiErrorMessage(
            error,
            "Unable to load stock operations data. Please try again.",
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

    const loadInitialStockPageData = async (): Promise<void> => {
      try {
        const [productData, warehouseData, stockData] = await Promise.all([
          getProducts(),
          getWarehouses(),
          getStock(),
        ]);

        const sortedProducts = [...productData].sort((first, second) => {
          const nameComparison = first.name.localeCompare(
            second.name,
            "en-GB",
            {
              sensitivity: "base",
            },
          );

          if (nameComparison !== 0) {
            return nameComparison;
          }

          return first.sku.localeCompare(second.sku, "en-GB", {
            sensitivity: "base",
          });
        });

        const sortedWarehouses = [...warehouseData].sort((first, second) => {
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

        const sortedStockItems = [...stockData.results].sort(
          (first, second) => {
            const productComparison = first.productName.localeCompare(
              second.productName,
              "en-GB",
              {
                sensitivity: "base",
              },
            );

            if (productComparison !== 0) {
              return productComparison;
            }

            return first.warehouseName.localeCompare(
              second.warehouseName,
              "en-GB",
              {
                sensitivity: "base",
              },
            );
          },
        );

        if (isActive) {
          setProducts(sortedProducts);
          setWarehouses(sortedWarehouses);
          setStockItems(sortedStockItems);
        }
      } catch (error) {
        console.error("Failed to load stock page data", error);

        if (isActive) {
          toast.error(
            getApiErrorMessage(
              error,
              "Unable to load stock operations data. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialStockPageData();

    return () => {
      isActive = false;
    };
  }, [])

  /**
   * Starts one stock mutation and blocks concurrent submissions.
   */
  const beginOperation = (
    operation: Exclude<PendingOperation, null>,
  ): boolean => {
    if (operationLockRef.current) {
      return false;
    }

    operationLockRef.current = true;
    setPendingOperation(operation);

    return true;
  };

  /**
   * Releases the shared stock-operation submission lock.
   */
  const finishOperation = () => {
    operationLockRef.current = false;
    setPendingOperation(null);
  };

  /**
   * Moves keyboard focus to the first field containing a validation error.
   */
  const focusFirstInvalidField = (formPrefix: string, errors: object) => {
    const firstInvalidField = Object.keys(errors)[0];

    if (firstInvalidField) {
      document.getElementById(`${formPrefix}-${firstInvalidField}`)?.focus();
    }
  };

  /**
   * Updates an assignment field and clears its existing validation error.
   */
  const handleAssignChange =
    (field: keyof AssignStockFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setAssignData((current) => ({
        ...current,
        [field]: value,
      }));

      setAssignErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const updatedErrors = { ...current };
        delete updatedErrors[field];

        return updatedErrors;
      });
    };

  /**
   * Updates a reservation field and clears its existing validation error.
   */
  const handleReserveChange =
    (field: keyof ReserveStockFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setReserveData((current) => ({
        ...current,
        [field]: value,
      }));

      setReserveErrors((current) => {
        const updatedErrors = { ...current };

        delete updatedErrors[field];

        if (field === "productId" || field === "warehouseId") {
          delete updatedErrors.quantity;
        }

        return updatedErrors;
      });
    };

  /**
   * Updates a release field and clears its existing validation error.
   */
  const handleReleaseChange =
    (field: keyof ReleaseStockFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setReleaseData((current) => ({
        ...current,
        [field]: value,
      }));

      setReleaseErrors((current) => {
        const updatedErrors = { ...current };

        delete updatedErrors[field];

        if (field === "productId" || field === "warehouseId") {
          delete updatedErrors.quantity;
        }

        return updatedErrors;
      });
    };

  /**
   * Updates a transfer field and clears its existing validation error.
   */
  const handleTransferChange =
    (field: keyof TransferStockFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;

      setTransferData((current) => ({
        ...current,
        [field]: value,
      }));

      setTransferErrors((current) => {
        const updatedErrors = { ...current };

        delete updatedErrors[field];

        if (field === "productId" || field === "fromWarehouseId") {
          delete updatedErrors.quantity;
        }

        if (field === "fromWarehouseId") {
          delete updatedErrors.toWarehouseId;
        }

        return updatedErrors;
      });
    };

  /**
   * Assigns new available stock to a product and warehouse.
   */
  const handleAssignStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateAssignStockForm(assignData);

    if (Object.keys(validationErrors).length > 0) {
      setAssignErrors(validationErrors);
      focusFirstInvalidField("assign", validationErrors);

      return;
    }

    if (!beginOperation("assign")) {
      return;
    }

    const payload: AssignStockRequest = {
      productId: Number(assignData.productId),
      warehouseId: Number(assignData.warehouseId),
      quantityAvailable: Number(assignData.quantityAvailable),
    };

    try {
      await assignStock(payload);

      const stockRefreshed = await loadStockPageData(false);

      setAssignData(emptyAssignValues);
      setAssignErrors({});

      if (stockRefreshed) {
        toast.success("Stock assigned successfully.");
      } else {
        toast.error(
          "Stock was assigned, but the stock records could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to assign stock", error);

      toast.error(
        getApiErrorMessage(error, "Unable to assign stock. Please try again."),
      );
    } finally {
      finishOperation();
    }
  };

  /**
   * Reserves units from currently available stock.
   */
  const handleReserveStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateReserveStockForm(reserveData, stockItems);

    if (Object.keys(validationErrors).length > 0) {
      setReserveErrors(validationErrors);
      focusFirstInvalidField("reserve", validationErrors);

      return;
    }

    if (!beginOperation("reserve")) {
      return;
    }

    const payload: ReserveStockRequest = {
      productId: Number(reserveData.productId),
      warehouseId: Number(reserveData.warehouseId),
      quantity: Number(reserveData.quantity),
    };

    try {
      await reserveStock(payload);

      const stockRefreshed = await loadStockPageData(false);

      setReserveData(emptyReserveValues);
      setReserveErrors({});

      if (stockRefreshed) {
        toast.success("Stock reserved successfully.");
      } else {
        toast.error(
          "Stock was reserved, but the stock records could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to reserve stock", error);

      toast.error(
        getApiErrorMessage(error, "Unable to reserve stock. Please try again."),
      );
    } finally {
      finishOperation();
    }
  };

  /**
   * Releases reserved units back into available stock.
   */
  const handleReleaseStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateReleaseStockForm(releaseData, stockItems);

    if (Object.keys(validationErrors).length > 0) {
      setReleaseErrors(validationErrors);
      focusFirstInvalidField("release", validationErrors);

      return;
    }

    if (!beginOperation("release")) {
      return;
    }

    const payload: ReleaseStockRequest = {
      productId: Number(releaseData.productId),
      warehouseId: Number(releaseData.warehouseId),
      quantity: Number(releaseData.quantity),
    };

    try {
      await releaseStock(payload);

      const stockRefreshed = await loadStockPageData(false);

      setReleaseData(emptyReleaseValues);
      setReleaseErrors({});

      if (stockRefreshed) {
        toast.success("Reserved stock released successfully.");
      } else {
        toast.error(
          "Reserved stock was released, but the records could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to release stock", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to release reserved stock. Please try again.",
        ),
      );
    } finally {
      finishOperation();
    }
  };

  /**
   * Transfers available stock between two warehouse locations.
   */
  const handleTransferStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateTransferStockForm(
      transferData,
      stockItems,
    );

    if (Object.keys(validationErrors).length > 0) {
      setTransferErrors(validationErrors);
      focusFirstInvalidField("transfer", validationErrors);

      return;
    }

    if (!beginOperation("transfer")) {
      return;
    }

    const payload: TransferStockRequest = {
      productId: Number(transferData.productId),
      fromWarehouseId: Number(transferData.fromWarehouseId),
      toWarehouseId: Number(transferData.toWarehouseId),
      quantity: Number(transferData.quantity),
    };

    try {
      await transferStock(payload);

      const stockRefreshed = await loadStockPageData(false);

      setTransferData(emptyTransferValues);
      setTransferErrors({});

      if (stockRefreshed) {
        toast.success("Stock transferred successfully.");
      } else {
        toast.error(
          "Stock was transferred, but the stock records could not be refreshed.",
        );
      }
    } catch (error) {
      console.error("Failed to transfer stock", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Unable to transfer stock. Please try again.",
        ),
      );
    } finally {
      finishOperation();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Stock Operations"
          description="Assign, reserve, release and transfer inventory between warehouse locations."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Assign stock</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Add available units to a product at a warehouse.
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleAssignStock}
                noValidate
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <FormField
                  id="assign-productId"
                  label="Product"
                  error={assignErrors.productId}
                  required
                >
                  <Select
                    id="assign-productId"
                    name="productId"
                    value={assignData.productId}
                    onChange={handleAssignChange("productId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(assignErrors.productId)}
                    aria-describedby={
                      assignErrors.productId
                        ? "assign-productId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="assign-warehouseId"
                  label="Warehouse"
                  error={assignErrors.warehouseId}
                  required
                >
                  <Select
                    id="assign-warehouseId"
                    name="warehouseId"
                    value={assignData.warehouseId}
                    onChange={handleAssignChange("warehouseId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(assignErrors.warehouseId)}
                    aria-describedby={
                      assignErrors.warehouseId
                        ? "assign-warehouseId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a warehouse</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.locationName}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="assign-quantityAvailable"
                  label="Quantity"
                  error={assignErrors.quantityAvailable}
                  hint="Enter the number of available units to add."
                  required
                  className="sm:col-span-2"
                >
                  <Input
                    id="assign-quantityAvailable"
                    name="quantityAvailable"
                    type="number"
                    inputMode="numeric"
                    value={assignData.quantityAvailable}
                    onChange={handleAssignChange("quantityAvailable")}
                    placeholder="Example: 20"
                    min="1"
                    step="1"
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(assignErrors.quantityAvailable)}
                    aria-describedby={
                      assignErrors.quantityAvailable
                        ? "assign-quantityAvailable-error"
                        : "assign-quantityAvailable-hint"
                    }
                  />
                </FormField>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full sm:col-span-2"
                  disabled={areFormsDisabled}
                >
                  {pendingOperation === "assign"
                    ? "Assigning stock..."
                    : "Assign stock"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reserve stock</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Move available units into reserved inventory.
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleReserveStock}
                noValidate
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <FormField
                  id="reserve-productId"
                  label="Product"
                  error={reserveErrors.productId}
                  required
                >
                  <Select
                    id="reserve-productId"
                    name="productId"
                    value={reserveData.productId}
                    onChange={handleReserveChange("productId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(reserveErrors.productId)}
                    aria-describedby={
                      reserveErrors.productId
                        ? "reserve-productId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="reserve-warehouseId"
                  label="Warehouse"
                  error={reserveErrors.warehouseId}
                  required
                >
                  <Select
                    id="reserve-warehouseId"
                    name="warehouseId"
                    value={reserveData.warehouseId}
                    onChange={handleReserveChange("warehouseId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(reserveErrors.warehouseId)}
                    aria-describedby={
                      reserveErrors.warehouseId
                        ? "reserve-warehouseId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a warehouse</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.locationName}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="reserve-quantity"
                  label="Quantity"
                  error={reserveErrors.quantity}
                  hint="The quantity cannot exceed current available stock."
                  required
                  className="sm:col-span-2"
                >
                  <Input
                    id="reserve-quantity"
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    value={reserveData.quantity}
                    onChange={handleReserveChange("quantity")}
                    placeholder="Example: 5"
                    min="1"
                    step="1"
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(reserveErrors.quantity)}
                    aria-describedby={
                      reserveErrors.quantity
                        ? "reserve-quantity-error"
                        : "reserve-quantity-hint"
                    }
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="h-11 w-full sm:col-span-2"
                  disabled={areFormsDisabled}
                >
                  {pendingOperation === "reserve"
                    ? "Reserving stock..."
                    : "Reserve stock"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Release reserved stock</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Return reserved units to available inventory.
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleReleaseStock}
                noValidate
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <FormField
                  id="release-productId"
                  label="Product"
                  error={releaseErrors.productId}
                  required
                >
                  <Select
                    id="release-productId"
                    name="productId"
                    value={releaseData.productId}
                    onChange={handleReleaseChange("productId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(releaseErrors.productId)}
                    aria-describedby={
                      releaseErrors.productId
                        ? "release-productId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="release-warehouseId"
                  label="Warehouse"
                  error={releaseErrors.warehouseId}
                  required
                >
                  <Select
                    id="release-warehouseId"
                    name="warehouseId"
                    value={releaseData.warehouseId}
                    onChange={handleReleaseChange("warehouseId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(releaseErrors.warehouseId)}
                    aria-describedby={
                      releaseErrors.warehouseId
                        ? "release-warehouseId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a warehouse</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.locationName}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="release-quantity"
                  label="Quantity"
                  error={releaseErrors.quantity}
                  hint="The quantity cannot exceed current reserved stock."
                  required
                  className="sm:col-span-2"
                >
                  <Input
                    id="release-quantity"
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    value={releaseData.quantity}
                    onChange={handleReleaseChange("quantity")}
                    placeholder="Example: 3"
                    min="1"
                    step="1"
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(releaseErrors.quantity)}
                    aria-describedby={
                      releaseErrors.quantity
                        ? "release-quantity-error"
                        : "release-quantity-hint"
                    }
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="h-11 w-full sm:col-span-2"
                  disabled={areFormsDisabled}
                >
                  {pendingOperation === "release"
                    ? "Releasing stock..."
                    : "Release stock"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer stock</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Move available units from one warehouse to another.
              </p>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleTransferStock}
                noValidate
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <FormField
                  id="transfer-productId"
                  label="Product"
                  error={transferErrors.productId}
                  required
                  className="sm:col-span-2"
                >
                  <Select
                    id="transfer-productId"
                    name="productId"
                    value={transferData.productId}
                    onChange={handleTransferChange("productId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(transferErrors.productId)}
                    aria-describedby={
                      transferErrors.productId
                        ? "transfer-productId-error"
                        : undefined
                    }
                  >
                    <option value="">Select a product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="transfer-fromWarehouseId"
                  label="Source warehouse"
                  error={transferErrors.fromWarehouseId}
                  required
                >
                  <Select
                    id="transfer-fromWarehouseId"
                    name="fromWarehouseId"
                    value={transferData.fromWarehouseId}
                    onChange={handleTransferChange("fromWarehouseId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(transferErrors.fromWarehouseId)}
                    aria-describedby={
                      transferErrors.fromWarehouseId
                        ? "transfer-fromWarehouseId-error"
                        : undefined
                    }
                  >
                    <option value="">Select the source</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.locationName}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="transfer-toWarehouseId"
                  label="Destination warehouse"
                  error={transferErrors.toWarehouseId}
                  required
                >
                  <Select
                    id="transfer-toWarehouseId"
                    name="toWarehouseId"
                    value={transferData.toWarehouseId}
                    onChange={handleTransferChange("toWarehouseId")}
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(transferErrors.toWarehouseId)}
                    aria-describedby={
                      transferErrors.toWarehouseId
                        ? "transfer-toWarehouseId-error"
                        : undefined
                    }
                  >
                    <option value="">Select the destination</option>

                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                        disabled={
                          warehouse.id === Number(transferData.fromWarehouseId)
                        }
                      >
                        {warehouse.locationName}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id="transfer-quantity"
                  label="Quantity"
                  error={transferErrors.quantity}
                  hint="Only currently available units can be transferred."
                  required
                  className="sm:col-span-2"
                >
                  <Input
                    id="transfer-quantity"
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    value={transferData.quantity}
                    onChange={handleTransferChange("quantity")}
                    placeholder="Example: 10"
                    min="1"
                    step="1"
                    disabled={areFormsDisabled}
                    required
                    aria-invalid={Boolean(transferErrors.quantity)}
                    aria-describedby={
                      transferErrors.quantity
                        ? "transfer-quantity-error"
                        : "transfer-quantity-hint"
                    }
                  />
                </FormField>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full sm:col-span-2"
                  disabled={areFormsDisabled}
                >
                  {pendingOperation === "transfer"
                    ? "Transferring stock..."
                    : "Transfer stock"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Stock records</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {stockItems.length === 1
                  ? "1 stock record"
                  : `${stockItems.length} stock records`}
              </p>
            </div>
          </CardHeader>

          {isLoading ? (
            <LoadingState message="Loading stock records..." />
          ) : stockItems.length === 0 ? (
            <EmptyState
              title="No stock records available"
              description="Assign stock to a product and warehouse to create the first stock record."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left text-sm">
                <caption className="sr-only">
                  Current product stock by warehouse
                </caption>

                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Product
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      SKU
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Warehouse
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Available
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Reserved
                    </th>

                    <th scope="col" className="px-6 py-3 font-medium">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stockItems.map((item) => (
                    <tr
                      key={`${item.productId}-${item.warehouseId}`}
                      className="border-t border-border transition hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {item.productName}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {item.sku}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {item.warehouseName}
                      </td>

                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {item.quantityAvailable}
                      </td>

                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {item.quantityReserved}
                      </td>

                      <td className="px-6 py-4 tabular-nums text-muted-foreground">
                        {item.totalQuantity}
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

export default StockTransfersPage;
