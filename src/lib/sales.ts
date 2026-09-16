import type { Product, Sale, SaleItem } from "@/types/types";
import { decreaseStock } from "./products";

export type CreateSaleInput = {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  amountPaid: number;
  cashierId: string;
  cashierName: string;
};

export function calculateSaleTotal(items: SaleItem[]): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
}

export function createSale(
  sales: Sale[],
  products: Product[],
  input: CreateSaleInput,
): {
  sale: Sale;
  products: Product[];
} {
  if (input.items.length === 0) {
    throw new Error("A sale must contain at least one item");
  }

  if (input.amountPaid < 0) {
    throw new Error("Amount paid cannot be negative");
  }

  const saleItems: SaleItem[] = input.items.map((item) => {
    if (item.quantity <= 0) {
      throw new Error("Sale quantity must be greater than zero");
    }

    const product = products.find(
      (product) => product.id === item.productId,
    );

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    return {
      productId: product.id,
      name: product.name,
      size: product.size,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const total = calculateSaleTotal(saleItems);

  if (input.amountPaid < total) {
    throw new Error("Amount paid is less than the sale total");
  }

  let updatedProducts = products;

  for (const item of input.items) {
    updatedProducts = decreaseStock(
      updatedProducts,
      item.productId,
      item.quantity,
    );
  }

  const sale: Sale = {
    id: crypto.randomUUID(),
    receiptNumber: generateReceiptNumber(sales),
    createdAt: new Date().toISOString(),
    items: saleItems,
    total,
    amountPaid: input.amountPaid,
    change: Number((input.amountPaid - total).toFixed(2)),
    cashierId: input.cashierId,
    cashierName: input.cashierName,
  };

  return {
    sale,
    products: updatedProducts,
  };
}

export function getSales(sales: Sale[]): Sale[] {
  return sales;
}

export function getSaleById(
  sales: Sale[],
  saleId: string,
): Sale | undefined {
  return sales.find((sale) => sale.id === saleId);
}

export function getSalesByDate(
  sales: Sale[],
  date: Date,
): Sale[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);

    return (
      saleDate.getFullYear() === year &&
      saleDate.getMonth() === month &&
      saleDate.getDate() === day
    );
  });
}

export function getTodaySales(sales: Sale[]): Sale[] {
  return getSalesByDate(sales, new Date());
}

function generateReceiptNumber(sales: Sale[]): string {
  const highestNumber = sales.reduce((highest, sale) => {
    const match = sale.receiptNumber.match(/(\d+)$/);

    if (!match) {
      return highest;
    }

    return Math.max(highest, Number(match[1]));
  }, 0);

  return `BB-${highestNumber + 1}`;
}