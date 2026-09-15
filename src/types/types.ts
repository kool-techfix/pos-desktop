export type Role = "ADMIN" | "SALES_PERSON";

export type User = {
  id: string;
  name: string;
  username?: string;
  password?: string;
  role: Role;
  signInCode?: string;
  active: boolean;
};

export type Business = { name: string };

export type Product = {
  id: string;
  name: string;
  size: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type Sale = {
  id: string;
  receiptNumber: string;
  createdAt: string;
  items: SaleItem[];
  total: number;
  amountPaid: number;
  change: number;
  cashierId: string;
  cashierName: string;
};

export type AppState = {
  business: Business;
  users: User[];
  products: Product[];
  sales: Sale[];
};

export type CartItem = SaleItem;
