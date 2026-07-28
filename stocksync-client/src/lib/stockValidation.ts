export interface StockSnapshot {
  productId: number;
  warehouseId: number;
  quantityAvailable: number;
  quantityReserved: number;
}

export interface AssignStockFormValues {
  productId: string;
  warehouseId: string;
  quantityAvailable: string;
}

export interface ReserveStockFormValues {
  productId: string;
  warehouseId: string;
  quantity: string;
}

export interface ReleaseStockFormValues {
  productId: string;
  warehouseId: string;
  quantity: string;
}

export interface TransferStockFormValues {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: string;
}

export type AssignStockFormErrors = Partial<
  Record<keyof AssignStockFormValues, string>
>;

export type ReserveStockFormErrors = Partial<
  Record<keyof ReserveStockFormValues, string>
>;

export type ReleaseStockFormErrors = Partial<
  Record<keyof ReleaseStockFormValues, string>
>;

export type TransferStockFormErrors = Partial<
  Record<keyof TransferStockFormValues, string>
>;

const parsePositiveInteger = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

const findStockRecord = (
  stockItems: StockSnapshot[],
  productId: number,
  warehouseId: number,
): StockSnapshot | undefined => {
  return stockItems.find(
    (item) => item.productId === productId && item.warehouseId === warehouseId,
  );
};

export const validateAssignStockForm = (
  values: AssignStockFormValues,
): AssignStockFormErrors => {
  const errors: AssignStockFormErrors = {};

  if (parsePositiveInteger(values.productId) === null) {
    errors.productId = "Select a valid product.";
  }

  if (parsePositiveInteger(values.warehouseId) === null) {
    errors.warehouseId = "Select a valid warehouse.";
  }

  if (parsePositiveInteger(values.quantityAvailable) === null) {
    errors.quantityAvailable =
      "Quantity must be a whole number greater than zero.";
  }

  return errors;
};

export const validateReserveStockForm = (
  values: ReserveStockFormValues,
  stockItems: StockSnapshot[],
): ReserveStockFormErrors => {
  const errors: ReserveStockFormErrors = {};

  const productId = parsePositiveInteger(values.productId);
  const warehouseId = parsePositiveInteger(values.warehouseId);
  const quantity = parsePositiveInteger(values.quantity);

  if (productId === null) {
    errors.productId = "Select a valid product.";
  }

  if (warehouseId === null) {
    errors.warehouseId = "Select a valid warehouse.";
  }

  if (quantity === null) {
    errors.quantity = "Quantity must be a whole number greater than zero.";
  }

  if (productId !== null && warehouseId !== null && quantity !== null) {
    const stockRecord = findStockRecord(stockItems, productId, warehouseId);

    if (stockRecord && quantity > stockRecord.quantityAvailable) {
      errors.quantity = `Only ${stockRecord.quantityAvailable} units are available to reserve.`;
    }
  }

  return errors;
};

export const validateReleaseStockForm = (
  values: ReleaseStockFormValues,
  stockItems: StockSnapshot[],
): ReleaseStockFormErrors => {
  const errors: ReleaseStockFormErrors = {};

  const productId = parsePositiveInteger(values.productId);
  const warehouseId = parsePositiveInteger(values.warehouseId);
  const quantity = parsePositiveInteger(values.quantity);

  if (productId === null) {
    errors.productId = "Select a valid product.";
  }

  if (warehouseId === null) {
    errors.warehouseId = "Select a valid warehouse.";
  }

  if (quantity === null) {
    errors.quantity = "Quantity must be a whole number greater than zero.";
  }

  if (productId !== null && warehouseId !== null && quantity !== null) {
    const stockRecord = findStockRecord(stockItems, productId, warehouseId);

    if (stockRecord && quantity > stockRecord.quantityReserved) {
      errors.quantity = `Only ${stockRecord.quantityReserved} reserved units can be released.`;
    }
  }

  return errors;
};

export const validateTransferStockForm = (
  values: TransferStockFormValues,
  stockItems: StockSnapshot[],
): TransferStockFormErrors => {
  const errors: TransferStockFormErrors = {};

  const productId = parsePositiveInteger(values.productId);
  const fromWarehouseId = parsePositiveInteger(values.fromWarehouseId);
  const toWarehouseId = parsePositiveInteger(values.toWarehouseId);
  const quantity = parsePositiveInteger(values.quantity);

  if (productId === null) {
    errors.productId = "Select a valid product.";
  }

  if (fromWarehouseId === null) {
    errors.fromWarehouseId = "Select a source warehouse.";
  }

  if (toWarehouseId === null) {
    errors.toWarehouseId = "Select a destination warehouse.";
  }

  if (
    fromWarehouseId !== null &&
    toWarehouseId !== null &&
    fromWarehouseId === toWarehouseId
  ) {
    errors.toWarehouseId =
      "The destination warehouse must differ from the source warehouse.";
  }

  if (quantity === null) {
    errors.quantity = "Quantity must be a whole number greater than zero.";
  }

  if (quantity === null) {
    errors.quantity = "Quantity must be a whole number greater than zero.";
  }

  if (productId !== null && fromWarehouseId !== null && quantity !== null) {
    const sourceStock = findStockRecord(
      stockItems,
      productId,
      fromWarehouseId,
    );

    if (sourceStock && quantity > sourceStock.quantityAvailable) {
      errors.quantity =
        `Only ${sourceStock.quantityAvailable} units are available to transfer.`;
    }
  }

  return errors;
};
