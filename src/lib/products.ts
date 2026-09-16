import type { Product } from "@/types/types";

export type ProductInput = Omit<Product, "id">;

export type ProductUpdate = Partial<Omit<Product, "id">>;

export function getProducts(products: Product[]): Product[] {
  return products;
}

export function getProductById(
  products: Product[],
  productId: string,
): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function addProduct(
  products: Product[],
  input: ProductInput,
): Product[] {
  const product: Product = {
    id: crypto.randomUUID(),
    ...input,
  };

  return [...products, product];
}

export function updateProduct(
  products: Product[],
  productId: string,
  updates: ProductUpdate,
): Product[] {
  return products.map((product) =>
    product.id === productId
      ? {
          ...product,
          ...updates,
        }
      : product,
  );
}

export function deleteProduct(
  products: Product[],
  productId: string,
): Product[] {
  return products.filter((product) => product.id !== productId);
}

export function increaseStock(
  products: Product[],
  productId: string,
  quantity: number,
): Product[] {
  if (quantity <= 0) {
    return products;
  }

  return products.map((product) =>
    product.id === productId
      ? {
          ...product,
          stock: product.stock + quantity,
        }
      : product,
  );
}

export function decreaseStock(
  products: Product[],
  productId: string,
  quantity: number,
): Product[] {
  if (quantity <= 0) {
    return products;
  }

  const product = getProductById(products, productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (quantity > product.stock) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }

  return products.map((product) =>
    product.id === productId
      ? {
          ...product,
          stock: product.stock - quantity,
        }
      : product,
  );
}

export function searchProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.size, product.category].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.stock <= product.lowStockThreshold,
  );
}
