import { describe, expect, it } from "vitest";
import type { Product, Sale } from "@/types/types";
import {
  calculateSaleTotal,
  createSale,
  getSaleById,
  getSalesByDate,
} from "./sales";

const products: Product[] = [
  {
    id: "p1",
    name: "Coca-Cola",
    size: "330 ml can",
    category: "Cola",
    price: 1.5,
    stock: 42,
    lowStockThreshold: 12,
  },
  {
    id: "p6",
    name: "Still Water",
    size: "500 ml bottle",
    category: "Water",
    price: 1.1,
    stock: 63,
    lowStockThreshold: 18,
  },
];

const sales: Sale[] = [
  {
    id: "s1",
    receiptNumber: "BB-1048",
    createdAt: "2026-09-15T10:18:00.000Z",
    items: [
      {
        productId: "p1",
        name: "Coca-Cola",
        size: "330 ml can",
        quantity: 2,
        unitPrice: 1.5,
      },
    ],
    total: 3,
    amountPaid: 5,
    change: 2,
    cashierId: "admin-1",
    cashierName: "Mara Ellis",
  },
];

describe("sales", () => {
  it("calculates the sale total", () => {
    const total = calculateSaleTotal([
      {
        productId: "p1",
        name: "Coca-Cola",
        size: "330 ml can",
        quantity: 2,
        unitPrice: 1.5,
      },
      {
        productId: "p6",
        name: "Still Water",
        size: "500 ml bottle",
        quantity: 1,
        unitPrice: 1.1,
      },
    ]);

    expect(total).toBe(4.1);
  });

  it("creates a sale and decreases stock", () => {
    const result = createSale(sales, products, {
      items: [
        {
          productId: "p1",
          quantity: 2,
        },
        {
          productId: "p6",
          quantity: 1,
        },
      ],
      amountPaid: 5,
      cashierId: "admin-1",
      cashierName: "Mara Ellis",
    });

    expect(result.sale.total).toBe(4.1);
    expect(result.sale.amountPaid).toBe(5);
    expect(result.sale.change).toBe(0.9);

    expect(result.sale.items).toHaveLength(2);

    expect(
      result.products.find((product) => product.id === "p1")?.stock,
    ).toBe(40);

    expect(
      result.products.find((product) => product.id === "p6")?.stock,
    ).toBe(62);
  });

  it("generates the next receipt number", () => {
    const result = createSale(sales, products, {
      items: [
        {
          productId: "p1",
          quantity: 1,
        },
      ],
      amountPaid: 2,
      cashierId: "admin-1",
      cashierName: "Mara Ellis",
    });

    expect(result.sale.receiptNumber).toBe("BB-1049");
  });

  it("rejects a sale with no items", () => {
    expect(() =>
      createSale(sales, products, {
        items: [],
        amountPaid: 10,
        cashierId: "admin-1",
        cashierName: "Mara Ellis",
      }),
    ).toThrow("A sale must contain at least one item");
  });

  it("rejects a sale when payment is insufficient", () => {
    expect(() =>
      createSale(sales, products, {
        items: [
          {
            productId: "p1",
            quantity: 2,
          },
        ],
        amountPaid: 2,
        cashierId: "admin-1",
        cashierName: "Mara Ellis",
      }),
    ).toThrow("Amount paid is less than the sale total");
  });

  it("rejects a sale when stock is insufficient", () => {
    expect(() =>
      createSale(sales, products, {
        items: [
          {
            productId: "p1",
            quantity: 50,
          },
        ],
        amountPaid: 100,
        cashierId: "admin-1",
        cashierName: "Mara Ellis",
      }),
    ).toThrow("Insufficient stock for Coca-Cola");
  });

  it("rejects an unknown product", () => {
    expect(() =>
      createSale(sales, products, {
        items: [
          {
            productId: "unknown",
            quantity: 1,
          },
        ],
        amountPaid: 10,
        cashierId: "admin-1",
        cashierName: "Mara Ellis",
      }),
    ).toThrow("Product not found: unknown");
  });

  it("finds a sale by ID", () => {
    const sale = getSaleById(sales, "s1");

    expect(sale?.receiptNumber).toBe("BB-1048");
  });

  it("filters sales by date", () => {
    const result = getSalesByDate(
      sales,
      new Date("2026-09-15T15:00:00.000Z"),
    );

    expect(result).toHaveLength(1);
  });
});