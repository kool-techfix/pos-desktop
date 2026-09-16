//pos/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  CircleDollarSign,
  LogOut,
  Printer,
  Search,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ReceiptPrint } from "@/components/ReceiptPrint";
import { money } from "@/lib/helpers";
import { searchProducts } from "@/lib/products";
import { calculateSaleTotal, createSale } from "@/lib/sales";
import type { AppState, CartItem, Product, Sale, User } from "@/types/types";
import "./_page.scss";

export default function Page({
  state,
  mutate,
  user,
  onSignOut,
}: {
  state: AppState;
  mutate: (fn: (current: AppState) => AppState) => void;
  user: User;
  onSignOut: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const products = state?.products ?? [];

  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const filtered = searchProducts(products, query).filter(
    (product) => category === "All" || product.category === category,
  );

  const total = calculateSaleTotal(cart);
  const paid = Number(amountPaid) || 0;
  const change = paid - total;

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => item.productId === product.id);
      if (found)
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item,
        );
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          size: product.size,
          quantity: 1,
          unitPrice: product.price,
        },
      ];
    });
  };

  const setQuantity = (id: string, quantity: number) => {
    const stock = products.find((product) => product.id === id)?.stock ?? 0;
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== id)
        : current.map((item) =>
            item.productId === id
              ? { ...item, quantity: Math.min(stock, quantity) }
              : item,
          ),
    );
  };

  const finishSale = () => {
    if (!cart.length || paid < total) {
      return;
    }

    try {
      const result = createSale(state.sales, state.products, {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        amountPaid: paid,
        cashierId: user.id,
        cashierName: user.name,
      });

      mutate((current) => ({
        ...current,
        products: result.products,
        sales: [result.sale, ...current.sales],
      }));

      setLastSale(result.sale);
      setCart([]);
      setAmountPaid("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="pos-page">
      <div className="pos-page__heading">
        <div>
          <p className="eyebrow">Point of sale</p>
          <h1>Make a sale</h1>
          <p>Tap a product, set the quantity, take payment.</p>
        </div>
        <button
          data-testid="button-pos-logout-mobile"
          onClick={onSignOut}
          className="pos-page__mobile-logout"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <div className="pos-page__layout">
        <section className="panel pos-page__catalog">
          <div className="pos-page__catalog-toolbar">
            <div className="pos-page__search">
              <Search size={17} />
              <input
                data-testid="input-pos-search"
                placeholder="Search drinks by name or size..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="pos-page__categories">
              {categories.map((item) => (
                <button
                  key={item}
                  data-testid={`button-category-${item.toLowerCase()}`}
                  className={
                    category === item
                      ? "pos-page__category pos-page__category--active"
                      : "pos-page__category"
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="pos-page__products">
            {filtered.map((product) => (
              <button
                key={product.id}
                data-testid={`card-product-${product.id}`}
                disabled={product.stock === 0}
                onClick={() => addToCart(product)}
                className="pos-page__product"
              >
                <div className="pos-page__product-top">
                  <span>
                    <Box size={17} />
                  </span>
                  {product.stock <= product.lowStockThreshold && <b>Low</b>}
                </div>
                <p>{product.name}</p>
                <small>{product.size}</small>
                <div className="pos-page__product-bottom">
                  <strong>{money(product.price)}</strong>
                  <small>{product.stock} in stock</small>
                </div>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className="pos-page__empty">
              <EmptyState
                icon={Search}
                title="No drinks found"
                body="Try a different name or category."
              />
            </div>
          )}
        </section>
        <section className="panel pos-page__basket">
          <div className="pos-page__basket-header">
            <div>
              <p>Current basket</p>
              <span>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              data-testid="button-clear-cart"
              onClick={() => {
                setCart([]);
                setAmountPaid("");
              }}
              disabled={!cart.length}
            >
              Clear all
            </button>
          </div>
          <div className="pos-page__basket-items">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.productId} className="pos-page__basket-item">
                  <div className="pos-page__basket-item-info">
                    <p>{item.name}</p>
                    <small>
                      {item.size} · {money(item.unitPrice)}
                    </small>
                    <div className="pos-page__quantity">
                      <button
                        data-testid={`button-decrease-${item.productId}`}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span data-testid={`text-quantity-${item.productId}`}>
                        {item.quantity}
                      </span>
                      <button
                        data-testid={`button-increase-${item.productId}`}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="pos-page__basket-item-total">
                    <strong>{money(item.unitPrice * item.quantity)}</strong>
                    <button
                      data-testid={`button-remove-${item.productId}`}
                      onClick={() => setQuantity(item.productId, 0)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="Basket is empty"
                body="Select a drink to begin the sale."
              />
            )}
          </div>
          <div className="pos-page__payment">
            <div className="pos-page__subtotal">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <label>
              <span>Amount paid</span>
              <div>
                <b>₦</b>
                <input
                  data-testid="input-amount-paid"
                  type="number"
                  min="0"
                  step=".01"
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </label>
            <div
              className={`pos-page__change ${change >= 0 && total > 0 ? "pos-page__change--ready" : ""}`}
            >
              <span>
                {change >= 0 && total > 0 ? "Change to give" : "Change"}
              </span>
              <strong data-testid="text-change">
                {money(Math.max(0, change))}
              </strong>
            </div>
            <button
              data-testid="button-complete-sale"
              onClick={finishSale}
              disabled={!cart.length || paid < total}
              className="app-button app-button--gold pos-page__complete"
            >
              <CircleDollarSign size={17} />
              Complete sale
            </button>
          </div>
        </section>
      </div>
      {lastSale && (
        <div className="pos-page__success">
          <div className="pos-page__success-heading">
            <div>
              <p className="eyebrow">Sale complete</p>
              <p data-testid="text-last-receipt">{lastSale.receiptNumber}</p>
            </div>
            <button
              data-testid="button-dismiss-last-sale"
              onClick={() => setLastSale(null)}
            >
              <X size={17} />
            </button>
          </div>
          <div className="pos-page__success-footer">
            <span>Total {money(lastSale.total)}</span>
            <button
              data-testid="button-print-last-receipt"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Print receipt
            </button>
          </div>
          <ReceiptPrint sale={lastSale} business={state.business} />
        </div>
      )}
    </div>
  );
}
