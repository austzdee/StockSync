import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/feedback/EmptyState";
import LoadingState from "@/components/feedback/LoadingState";
import ReportsChart from "@/components/ReportsChart";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAuditLogs, type AuditLog } from "@/services/auditService";
import { getProducts, type Product } from "@/services/productService";
import { getStock, type StockItem } from "@/services/stockService";
import { getWarehouses, type Warehouse } from "@/services/warehouseService";

type StockStatus = "Critical" | "Low" | "Healthy";

const lowStockThreshold = 10;
const criticalStockThreshold = 5;

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getActionBadgeClass = (action: string) => {
  switch (action.toUpperCase()) {
    case "ASSIGN":
      return "border-success/30 bg-success/10 text-success";

    case "RESERVE":
      return "border-warning/30 bg-warning/10 text-warning";

    case "RELEASE":
      return "border-primary/30 bg-primary/10 text-primary";

    case "TRANSFER":
    case "TRANSFER_IN":
    case "TRANSFER_OUT":
      return "border-chart-2/30 bg-chart-2/10 text-chart-2";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
};

const getStockStatus = (totalQuantity: number): StockStatus => {
  if (totalQuantity <= criticalStockThreshold) {
    return "Critical";
  }

  if (totalQuantity < lowStockThreshold) {
    return "Low";
  }

  return "Healthy";
};

const getStockStatusBadgeClass = (status: StockStatus) => {
  switch (status) {
    case "Critical":
      return "border-destructive/30 bg-destructive/10 text-destructive";

    case "Low":
      return "border-warning/30 bg-warning/10 text-warning";

    default:
      return "border-success/30 bg-success/10 text-success";
  }
};

const escapeCsvValue = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

const ReportsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Loads all source data required by the reports page.
   */
  const loadReportData = async (
    showErrorNotification = true,
  ): Promise<boolean> => {
    try {
      const [productData, warehouseData, stockData, auditData] =
        await Promise.all([
          getProducts(),
          getWarehouses(),
          getStock(),
          getAuditLogs(),
        ]);

      const sortedProducts = [...productData].sort((first, second) =>
        first.name.localeCompare(second.name, "en-GB", {
          sensitivity: "base",
        }),
      );

      const sortedWarehouses = [...warehouseData].sort((first, second) =>
        first.locationName.localeCompare(second.locationName, "en-GB", {
          sensitivity: "base",
        }),
      );

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
      setAuditLogs(auditData);

      return true;
    } catch (error) {
      console.error("Failed to load report data", error);

      const message = getApiErrorMessage(
        error,
        "Unable to load report data. Please try again.",
      );

      setLoadError(message);

      if (showErrorNotification) {
        toast.error(message);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // State updates occur only after the asynchronous requests settle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReportData();
  }, []);

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  const warehouseNames = useMemo(
    () =>
      new Map(
        warehouses.map((warehouse) => [warehouse.id, warehouse.locationName]),
      ),
    [warehouses],
  );

  const filteredStockItems = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLocaleLowerCase("en-GB");

    return stockItems.filter((item) => {
      const matchesSearch =
        normalisedSearch.length === 0 ||
        item.productName
          .toLocaleLowerCase("en-GB")
          .includes(normalisedSearch) ||
        item.sku.toLocaleLowerCase("en-GB").includes(normalisedSearch) ||
        item.category.toLocaleLowerCase("en-GB").includes(normalisedSearch);

      const matchesWarehouse =
        selectedWarehouseId === "all" ||
        item.warehouseId === Number(selectedWarehouseId);

      const matchesLowStock =
        !showLowStockOnly || item.totalQuantity < lowStockThreshold;

      return matchesSearch && matchesWarehouse && matchesLowStock;
    });
  }, [searchTerm, selectedWarehouseId, showLowStockOnly, stockItems]);

  const totalAvailableUnits = useMemo(
    () =>
      filteredStockItems.reduce((sum, item) => sum + item.quantityAvailable, 0),
    [filteredStockItems],
  );

  const totalReservedUnits = useMemo(
    () =>
      filteredStockItems.reduce((sum, item) => sum + item.quantityReserved, 0),
    [filteredStockItems],
  );

  const totalInventoryUnits = useMemo(
    () => filteredStockItems.reduce((sum, item) => sum + item.totalQuantity, 0),
    [filteredStockItems],
  );

  const lowStockItems = useMemo(
    () =>
      filteredStockItems.filter(
        (item) => item.totalQuantity < lowStockThreshold,
      ),
    [filteredStockItems],
  );

  const filteredProductCount = useMemo(
    () => new Set(filteredStockItems.map((item) => item.productId)).size,
    [filteredStockItems],
  );

  const filteredWarehouseCount = useMemo(() => {
    if (selectedWarehouseId === "all") {
      return warehouses.length;
    }

    return new Set(filteredStockItems.map((item) => item.warehouseId)).size;
  }, [filteredStockItems, selectedWarehouseId, warehouses.length]);

  const inventoryByProduct = useMemo(() => {
    const productTotals = new Map<number, { name: string; value: number }>();

    filteredStockItems.forEach((item) => {
      const existing = productTotals.get(item.productId);

      productTotals.set(item.productId, {
        name: `${item.productName} (${item.sku})`,
        value: (existing?.value ?? 0) + item.totalQuantity,
      });
    });

    return Array.from(productTotals.values()).sort(
      (first, second) =>
        second.value - first.value ||
        first.name.localeCompare(second.name, "en-GB", {
          sensitivity: "base",
        }),
    );
  }, [filteredStockItems]);

  const inventoryByWarehouse = useMemo(
    () =>
      warehouses
        .map((warehouse) => ({
          name: warehouse.locationName,
          value: filteredStockItems
            .filter((item) => item.warehouseId === warehouse.id)
            .reduce((sum, item) => sum + item.totalQuantity, 0),
        }))
        .sort(
          (first, second) =>
            second.value - first.value ||
            first.name.localeCompare(second.name, "en-GB", {
              sensitivity: "base",
            }),
        ),
    [filteredStockItems, warehouses],
  );

  const recentAuditLogs = useMemo(
    () =>
      [...auditLogs]
        .sort(
          (first, second) =>
            new Date(second.createdAtUtc).getTime() -
            new Date(first.createdAtUtc).getTime(),
        )
        .slice(0, 5),
    [auditLogs],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedWarehouseId !== "all" ||
    showLowStockOnly;

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    void loadReportData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedWarehouseId("all");
    setShowLowStockOnly(false);
  };

  /**
   * Downloads the currently filtered low-stock records as CSV.
   */
  const handleExportCsv = () => {
    if (lowStockItems.length === 0) {
      toast.error("There are no low-stock records to export.");

      return;
    }

    const headers = [
      "Product",
      "SKU",
      "Warehouse",
      "Available",
      "Reserved",
      "Total",
      "Status",
    ];

    const rows = lowStockItems.map((item) => [
      item.productName,
      item.sku,
      item.warehouseName,
      item.quantityAvailable,
      item.quantityReserved,
      item.totalQuantity,
      getStockStatus(item.totalQuantity),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `low-stock-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    toast.success("Low-stock CSV report downloaded.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Reports"
          description="Inventory insights, stock risks and warehouse summaries."
          actions={
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 px-5"
              onClick={handleExportCsv}
              disabled={
                isLoading || loadError !== null || lowStockItems.length === 0
              }
            >
              Export low-stock CSV
            </Button>
          }
        />

        {isLoading ? (
          <Card>
            <LoadingState message="Loading report data..." />
          </Card>
        ) : loadError ? (
          <Card>
            <EmptyState
              title="Reports could not be loaded"
              description={loadError}
              action={
                <Button type="button" onClick={handleRetry}>
                  Retry
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Report filters</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Filter inventory records by product, category, SKU, warehouse
                  or stock level.
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField
                    id="reports-search"
                    label="Search inventory"
                    hint="Search by product name, SKU or category."
                  >
                    <Input
                      id="reports-search"
                      name="search"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Example: keyboard or KB-1001"
                      autoComplete="off"
                      aria-describedby="reports-search-hint"
                    />
                  </FormField>

                  <FormField id="reports-warehouse" label="Warehouse">
                    <Select
                      id="reports-warehouse"
                      name="warehouse"
                      value={selectedWarehouseId}
                      onChange={(event) =>
                        setSelectedWarehouseId(event.target.value)
                      }
                    >
                      <option value="all">All warehouses</option>

                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.locationName}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <div className="flex flex-col justify-end gap-3">
                    <label
                      htmlFor="reports-low-stock-only"
                      className="flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm"
                    >
                      <input
                        id="reports-low-stock-only"
                        type="checkbox"
                        checked={showLowStockOnly}
                        onChange={(event) =>
                          setShowLowStockOnly(event.target.checked)
                        }
                        className="size-4 accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                      />
                      Show low-stock records only
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      Clear filters
                    </Button>
                  </div>
                </div>

                <p
                  className="mt-5 text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredStockItems.length.toLocaleString("en-GB")}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {stockItems.length.toLocaleString("en-GB")}
                  </span>{" "}
                  inventory records.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <DashboardCard
                title="Products"
                value={filteredProductCount}
                description="Products matching the current filters"
              />

              <DashboardCard
                title="Warehouses"
                value={filteredWarehouseCount}
                description={
                  selectedWarehouseId === "all"
                    ? "Storage locations currently configured"
                    : "Warehouses represented in the results"
                }
              />

              <DashboardCard
                title="Available units"
                value={totalAvailableUnits}
                description="Units available for allocation"
              />

              <DashboardCard
                title="Reserved units"
                value={totalReservedUnits}
                description="Units currently reserved"
                tone="danger"
              />

              <DashboardCard
                title="Inventory units"
                value={totalInventoryUnits}
                description="Available and reserved units combined"
                tone="success"
              />

              <DashboardCard
                title="Low-stock records"
                value={lowStockItems.length}
                description={`Records below ${lowStockThreshold} total units`}
                tone="warning"
              />
            </div>

            <div className="grid min-w-0 gap-8 xl:grid-cols-2">
              <ReportsChart
                title="Inventory by product"
                data={inventoryByProduct}
              />

              <ReportsChart
                title="Inventory by warehouse"
                data={inventoryByWarehouse}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  The five most recent inventory movements.
                </p>
              </CardHeader>

              {recentAuditLogs.length === 0 ? (
                <EmptyState
                  title="No recent activity"
                  description="Inventory movements will appear here after stock operations are completed."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-left text-sm">
                    <caption className="sr-only">
                      Five most recent inventory movements
                    </caption>

                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-6 py-3 font-medium">
                          Action
                        </th>

                        <th scope="col" className="px-6 py-3 font-medium">
                          Product
                        </th>

                        <th scope="col" className="px-6 py-3 font-medium">
                          Warehouse
                        </th>

                        <th scope="col" className="px-6 py-3 font-medium">
                          Quantity
                        </th>

                        <th scope="col" className="px-6 py-3 font-medium">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentAuditLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-t border-border transition hover:bg-muted/20"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getActionBadgeClass(
                                log.action,
                              )}`}
                            >
                              {log.action.replaceAll("_", " ")}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-medium text-foreground">
                            {productNames.get(log.productId) ??
                              `Product #${log.productId}`}
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            {warehouseNames.get(log.warehouseId) ??
                              `Warehouse #${log.warehouseId}`}
                          </td>

                          <td className="px-6 py-4 tabular-nums text-muted-foreground">
                            {log.quantityChanged > 0
                              ? `+${log.quantityChanged}`
                              : log.quantityChanged}
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(log.createdAtUtc)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low-stock report</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Inventory records containing fewer than {lowStockThreshold}{" "}
                  total units.
                </p>
              </CardHeader>

              {lowStockItems.length === 0 ? (
                <EmptyState
                  title="No low-stock records found"
                  description={
                    filteredStockItems.length === 0
                      ? "No inventory records match the current filters."
                      : "All matching inventory records are above the low-stock threshold."
                  }
                  action={
                    hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-232 text-left text-sm">
                    <caption className="sr-only">
                      Low-stock inventory records
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

                        <th scope="col" className="px-6 py-3 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {lowStockItems.map((item) => {
                        const status = getStockStatus(item.totalQuantity);

                        return (
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

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStockStatusBadgeClass(
                                  status,
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
