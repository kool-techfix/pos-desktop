import type {
  Business,
  Product,
  Sale,
  User,
} from "@/types/types";

export const seedBusiness: Business = {
  name: "Bluebird Drinks",
};

export const seedUsers: User[] = [
  {
    id: "admin-1",
    name: "Mara Ellis",
    username: "owner@bluebird.test",
    password: "bluebird",
    role: "ADMIN",
    active: true,
  },
  {
    id: "sp-1",
    name: "Jon Bell",
    role: "SALES_PERSON",
    signInCode: "JB4826",
    active: true,
  },
];

export const seedProducts: Product[] = [
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
  {
    id: "p4",
    name: "Sprite",
    size: "500 ml bottle",
    category: "Lemon-lime",
    price: 1.8,
    stock: 31,
    lowStockThreshold: 10,
  },
  {
    id: "p5",
    name: "Red Bull",
    size: "250 ml can",
    category: "Energy",
    price: 3.25,
    stock: 17,
    lowStockThreshold: 8,
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
  {
    id: "p7",
    name: "Ginger Beer",
    size: "330 ml bottle",
    category: "Specialty",
    price: 2.4,
    stock: 6,
    lowStockThreshold: 8,
  },
  {
    id: "p8",
    name: "Iced Tea Peach",
    size: "500 ml bottle",
    category: "Tea",
    price: 2.1,
    stock: 22,
    lowStockThreshold: 8,
  },
];

export function createSeedSales(): Sale[] {
  const now = new Date();

  const yesterday = new Date(
    now.getTime() - 24 * 60 * 60 * 1000,
  );

  const todaySaleTime = new Date(now);
  todaySaleTime.setHours(10, 18, 0, 0);

  return [
    {
      id: "s1",
      receiptNumber: "BB-1048",
      createdAt: todaySaleTime.toISOString(),
      items: [
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
      ],
      total: 4.1,
      amountPaid: 5,
      change: 0.9,
      cashierId: "admin-1",
      cashierName: "Mara Ellis",
    },
    {
      id: "s2",
      receiptNumber: "BB-1047",
      createdAt: yesterday.toISOString(),
      items: [
        {
          productId: "p5",
          name: "Red Bull",
          size: "250 ml can",
          quantity: 1,
          unitPrice: 3.25,
        },
      ],
      total: 3.25,
      amountPaid: 5,
      change: 1.75,
      cashierId: "sp-1",
      cashierName: "Jon Bell",
    },
    {
      id: "s3",
      receiptNumber: "BB-1046",
      createdAt: yesterday.toISOString(),
      items: [
        {
          productId: "p3",
          name: "Fanta Orange",
          size: "500 ml bottle",
          quantity: 2,
          unitPrice: 1.8,
        },
      ],
      total: 3.6,
      amountPaid: 5,
      change: 1.4,
      cashierId: "admin-1",
      cashierName: "Mara Ellis",
    },
  ];
}