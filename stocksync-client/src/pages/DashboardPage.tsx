import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import DashboardCard from "@/components/DashboardCard";
import DashboardCharts from "@/components/DashboardCharts";
import EmptyState from "@/components/feedback/EmptyState";
import LoadingState from "@/components/feedback/LoadingState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAuditLogs, type AuditLog } from "@/services/auditService";
import { getProducts, type Product } from "@/services/productService";
import { getStock, type StockItem } from "@/services/stockService";
import { getWarehouses, type Warehouse } from "@/services/warehouseService";

const lowStockThreshold = 10;
const criticalStockThreshold = 5;

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatAction = (action: string) => action.replaceAll("_", " ");

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

const getStockStatus = (totalQuantity: number) => {
  if (totalQuantity <= criticalStockThreshold) {
    return "Critical";
  }

  if (totalQuantity < lowStockThreshold) {
    return "Low";
  }

  return "Healthy";
};

const getStockStatusBadgeClass = (totalQuantity: number) => {
  const status = getStockStatus(totalQuantity);

  if (status === "Critical") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (status === "Low") {
    return "border-warning/30 bg-warning/10 text-warning";
  }

  return "border-success/30 bg-success/10 text-success";
};

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Loads the inventory data required by the dashboard.
   */
  const loadDashboardData = async (
    showErrorNotification = true,
  ): Promise<boolean> => {
    try {
      const [productData, warehouseData, stockData, auditLogData] =
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
      setAuditLogs(auditLogData);

      return true;
    } catch (error) {
      console.error("Failed to load dashboard data", error);

      const message = getApiErrorMessage(
        error,
        "Unable to load dashboard data. Please try again.",
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
    void loadDashboardData();
  }, []);

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  const productPrices = useMemo(
    () => new Map(products.map((product) => [product.id, product.price])),
    [products],
  );

  const warehouseNames = useMemo(
    () =>
      new Map(
        warehouses.map((warehouse) => [warehouse.id, warehouse.locationName]),
      ),
    [warehouses],
  );

  const knownWarehouseIds = useMemo(
    () => new Set(warehouses.map((warehouse) => warehouse.id)),
    [warehouses],
  );

  const totalAvailableUnits = useMemo(
    () => stockItems.reduce((sum, item) => sum + item.quantityAvailable, 0),
    [stockItems],
  );

  const totalReservedUnits = useMemo(
    () => stockItems.reduce((sum, item) => sum + item.quantityReserved, 0),
    [stockItems],
  );

  const totalInventoryUnits = useMemo(
    () => stockItems.reduce((sum, item) => sum + item.totalQuantity, 0),
    [stockItems],
  );

  const inventoryValue = useMemo(
    () =>
      stockItems.reduce((total, stockItem) => {
        const unitPrice = productPrices.get(stockItem.productId) ?? 0;

        return total + unitPrice * stockItem.quantityAvailable;
      }, 0),
    [productPrices, stockItems],
  );

  const lowStockRecords = useMemo(
    () => stockItems.filter((item) => item.totalQuantity < lowStockThreshold),
    [stockItems],
  );

  const reservedStockPercentage =
    totalInventoryUnits === 0
      ? 0
      : Math.round((totalReservedUnits / totalInventoryUnits) * 100);

  const activeWarehouseCount = useMemo(
    () =>
      new Set(
        stockItems
          .filter(
            (item) =>
              item.totalQuantity > 0 && knownWarehouseIds.has(item.warehouseId),
          )
          .map((item) => item.warehouseId),
      ).size,
    [knownWarehouseIds, stockItems],
  );

  const warehouseUtilization =
    warehouses.length === 0
      ? 0
      : Math.round((activeWarehouseCount / warehouses.length) * 100);

  const inventoryByCategory = useMemo(() => {
    const categoryTotals = stockItems.reduce<Record<string, number>>(
      (result, item) => {
        const category = item.category.trim() || "Uncategorised";

        result[category] = (result[category] ?? 0) + item.totalQuantity;

        return result;
      },
      {},
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (first, second) =>
          second.value - first.value ||
          first.name.localeCompare(second.name, "en-GB", {
            sensitivity: "base",
          }),
      );
  }, [stockItems]);

  const inventoryByWarehouse = useMemo(
    () =>
      warehouses
        .map((warehouse) => ({
          name: warehouse.locationName,
          value: stockItems
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
    [stockItems, warehouses],
  );

  const topStockItems = useMemo(
    () =>
      [...stockItems]
        .sort(
          (first, second) =>
            second.totalQuantity - first.totalQuantity ||
            first.productName.localeCompare(second.productName, "en-GB", {
              sensitivity: "base",
            }),
        )
        .slice(0, 5),
    [stockItems],
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

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    void loadDashboardData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Real-time inventory performance, stock risks and warehouse insights."
        />

        {isLoading ? (
          <Card>
            <LoadingState message="Loading dashboard analytics..." />
          </Card>
        ) : loadError ? (
          <Card>
            <EmptyState
              title="Dashboard could not be loaded"
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <DashboardCard
                title="Total products"
                value={products.length}
                description="Products currently tracked"
              />

              <DashboardCard
                title="Warehouses"
                value={warehouses.length}
                description="Storage locations currently configured"
                tone="success"
              />

              <DashboardCard
                title="Available units"
                value={totalAvailableUnits}
                description="Units available for sale or allocation"
              />

              <DashboardCard
                title="Reserved units"
                value={totalReservedUnits}
                description={`${reservedStockPercentage}% of inventory reserved`}
                tone="danger"
              />

              <DashboardCard
                title="Inventory units"
                value={totalInventoryUnits}
                description="Available and reserved units combined"
                tone="success"
              />

              <DashboardCard
                title="Inventory value"
                value={currencyFormatter.format(inventoryValue)}
                description="Current value of available inventory"
                tone="success"
              />

              <DashboardCard
                title="Low-stock records"
                value={lowStockRecords.length}
                description={`Records below ${lowStockThreshold} total units`}
                tone="warning"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsPanel
                title="Recent activity"
                description="The five most recent inventory movements."
              >
                {recentAuditLogs.length === 0 ? (
                  <EmptyState
                    title="No recent activity"
                    description="Inventory movements will appear after stock operations are completed."
                  />
                ) : (
                  <ul className="space-y-3">
                    {recentAuditLogs.map((log) => (
                      <li
                        key={log.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getActionBadgeClass(
                                log.action,
                              )}`}
                            >
                              {formatAction(log.action)}
                            </span>

                            <p className="truncate font-medium text-foreground">
                              {productNames.get(log.productId) ??
                                `Product #${log.productId}`}
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {warehouseNames.get(log.warehouseId) ??
                              `Warehouse #${log.warehouseId}`}
                            {" · "}
                            {formatDate(log.createdAtUtc)}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                          {log.quantityChanged > 0
                            ? `+${log.quantityChanged}`
                            : log.quantityChanged}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Inventory health"
                description="Operational overview of current stock performance."
              >
                <dl>
                  <AnalyticsMetric
                    label="Reserved stock ratio"
                    value={`${reservedStockPercentage}%`}
                  />

                  <AnalyticsMetric
                    label="Warehouse utilisation"
                    value={`${warehouseUtilization}%`}
                  />

                  <AnalyticsMetric
                    label="Active warehouses"
                    value={`${activeWarehouseCount} of ${warehouses.length}`}
                  />

                  <AnalyticsMetric
                    label="Low-stock records"
                    value={lowStockRecords.length}
                  />
                </dl>
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Top stock items"
                description="Highest quantity stock records across all warehouses."
              >
                {topStockItems.length === 0 ? (
                  <EmptyState
                    title="No stock records"
                    description="Top inventory records will appear after stock is assigned."
                  />
                ) : (
                  <ul className="space-y-3">
                    {topStockItems.map((item) => (
                      <li
                        key={`${item.productId}-${item.warehouseId}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {item.productName}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {item.warehouseName}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                          {item.totalQuantity.toLocaleString("en-GB")} units
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AnalyticsPanel>

              <AnalyticsPanel
                title="Low-stock watchlist"
                description="Inventory records that may need replenishment."
              >
                {lowStockRecords.length === 0 ? (
                  <EmptyState
                    title="No low-stock records"
                    description="All inventory records are above the low-stock threshold."
                  />
                ) : (
                  <ul className="space-y-3">
                    {lowStockRecords.slice(0, 5).map((item) => (
                      <li
                        key={`${item.productId}-${item.warehouseId}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {item.productName}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {item.warehouseName}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStockStatusBadgeClass(
                            item.totalQuantity,
                          )}`}
                        >
                          {getStockStatus(item.totalQuantity)}:{" "}
                          {item.totalQuantity.toLocaleString("en-GB")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AnalyticsPanel>
            </div>

            <DashboardCharts
              categoryData={inventoryByCategory}
              warehouseData={inventoryByWarehouse}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

interface AnalyticsPanelProps {
  title: string;
  description: string;
  children: ReactNode;
}

const AnalyticsPanel = ({
  title,
  description,
  children,
}: AnalyticsPanelProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </CardHeader>

    <CardContent>{children}</CardContent>
  </Card>
);

interface AnalyticsMetricProps {
  label: string;
  value: string | number;
}

const AnalyticsMetric = ({ label, value }: AnalyticsMetricProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>

    <dd className="text-lg font-bold tabular-nums text-foreground">
      {typeof value === "number" ? value.toLocaleString("en-GB") : value}
    </dd>
  </div>
);

export default DashboardPage;
