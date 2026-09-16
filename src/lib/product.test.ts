import { describe, expect, it } from "vitest";
import type { Product } from "@/types/types";
import {
  addProduct,
  decreaseStock,
  deleteProduct,
  getLowStockProducts,
  getProductById,
  increaseStock,
  searchProducts,
  updateProduct,
} from "./products";

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
    id: "p2",
    name: "Pepsi",
    size: "330 ml can",
    category: "Cola",
    price: 1.45,
    stock: 28,
    lowStockThreshold: 12,
  },
  {
    id: "p3",
    name: "Fanta Orange",
    size: "500 ml bottle",
    category: "Orange",
    price: 1.8,
    stock: 9,
    lowStockThreshold: 10,
  },
];

describe("products", () => {
  it("finds a product by ID", () => {
    const product = getProductById(products, "p1");

    expect(product?.name).toBe("Coca-Cola");
  });

  it("returns undefined for an unknown product", () => {
    const product = getProductById(products, "unknown");

    expect(product).toBeUndefined();
  });

  it("adds a product", () => {
    const result = addProduct(products, {
      name: "Sprite",
      size: "500 ml bottle",
      category: "Lemon-lime",
      price: 1.8,
      stock: 20,
      lowStockThreshold: 10,
    });

    expect(result).toHaveLength(4);
    expect(result[3].name).toBe("Sprite");
    expect(result[3].id).toBeDefined();
  });

  it("updates a product without changing the original array", () => {
    const result = updateProduct(products, "p1", {
      price: 1.75,
    });

    expect(result.find((product) => product.id === "p1")?.price).toBe(1.75);
    expect(products.find((product) => product.id === "p1")?.price).toBe(1.5);
  });

  it("deletes a product", () => {
    const result = deleteProduct(products, "p2");

    expect(result).toHaveLength(2);
    expect(getProductById(result, "p2")).toBeUndefined();
  });

  it("increases stock", () => {
    const result = increaseStock(products, "p1", 10);

    expect(getProductById(result, "p1")?.stock).toBe(52);
  });

  it("decreases stock", () => {
    const result = decreaseStock(products, "p1", 10);

    expect(getProductById(result, "p1")?.stock).toBe(32);
  });

  it("rejects a stock decrease greater than available stock", () => {
    expect(() => decreaseStock(products, "p3", 10)).toThrow(
      "Insufficient stock for Fanta Orange",
    );
  });

  it("finds low-stock products", () => {
    const result = getLowStockProducts(products);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Fanta Orange");
  });

  it("searches by product name", () => {
    const result = searchProducts(products, "coca");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Coca-Cola");
  });

  it("searches by category", () => {
    const result = searchProducts(products, "cola");

    expect(result).toHaveLength(2);
  });

  it("returns all products for an empty search", () => {
    const result = searchProducts(products, "");

    expect(result).toHaveLength(3);
  });
});