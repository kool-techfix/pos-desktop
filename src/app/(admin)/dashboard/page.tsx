
"use client";

import {
  ArrowUpRight,
  ChevronRight,
  CircleDollarSign,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";

import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { Metric } from "@/components/Metric";
import { PageTitle } from "@/components/PageTitle";

import { getTodaySales } from "@/lib/sales";
import { getLowStockProducts, getProducts } from "@/lib/products";
import { money, dateTime } from "@/lib/helpers";

import type { AppState } from "@/types/types";

import "./_page.scss";

export default function Page({ state }: { state: AppState }) {
  const sales = state?.sales ?? [];
  const products = state?.products ?? [];

  const todaySales = getTodaySales(sales);
  const allProducts = getProducts(products);
  const low = getLowStockProducts(allProducts);

  const revenue = todaySales.reduce(
    (sum, sale) => sum + sale.total,
    0,
  );

  const itemsInStock = allProducts.reduce(
    (sum, product) => sum + product.stock,
    0,
  );

  return (
    <div className="dashboard-page">
      <PageTitle
        eyebrow="Overview"
        title="Today at a glance"
        description="The numbers that matter for the next shift."
        action={
          <Link
            href="/pos"
            data-testid="link-dashboard-start-sale"
            className="app-button app-button--primary"
          >
            <ShoppingCart size={16} />
            Start a sale
          </Link>
        }
      />

      <div className="dashboard-page__metrics">
        <Metric
          icon={CircleDollarSign}
          label="Sales today"
          value={money(revenue)}
          note={`${todaySales.length} receipts`}
          tone="gold"
        />

        <Metric
          icon={Receipt}
          label="Receipts today"
          value={String(todaySales.length).padStart(2, "0")}
          note="Across all cashiers"
        />

        <Metric
          icon={Package}
          label="Items in stock"
          value={String(itemsInStock)}
          note={`${allProducts.length} products`}
        />

        <Metric
          icon={SlidersHorizontal}
          label="Needs attention"
          value={String(low.length).padStart(2, "0")}
          note={low.length ? "Below threshold" : "Stock is healthy"}
          tone={low.length ? "red" : "green"}
        />
      </div>

      <div className="dashboard-page__columns">
        <section className="panel dashboard-page__sales">
          <div className="dashboard-page__section-header">
            <div>
              <p>Recent sales</p>
              <span>Latest activity from the counter</span>
            </div>

            <Link
              href="/sales"
              data-testid="link-dashboard-sales"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="dashboard-page__table-scroll">
            <table className="dashboard-page__table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Cashier</th>
                  <th>Time</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td className="mono">{sale.receiptNumber}</td>
                    <td>{sale.cashierName}</td>
                    <td className="muted">
                      {dateTime(sale.createdAt)}
                    </td>
                    <td className="total">
                      {money(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel dashboard-page__stock">
          <div className="dashboard-page__section-header dashboard-page__section-header--stacked">
            <div>
              <p>Stock watch</p>
              <span>Restock before the shelf goes quiet</span>
            </div>
          </div>

          <div className="dashboard-page__stock-list">
            {low.length ? (
              low.map((product) => (
                <div
                  key={product.id}
                  className="dashboard-page__stock-row"
                >
                  <div>
                    <p>{product.name}</p>
                    <span>{product.size}</span>
                  </div>

                  <div>
                    <strong>{product.stock} left</strong>
                    <span>
                      threshold {product.lowStockThreshold}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Package}
                title="All shelves look good"
                body="No products are below their reorder point."
              />
            )}
          </div>

          <div className="dashboard-page__section-footer">
            <Link
              href="/inventory"
              data-testid="link-dashboard-inventory"
            >
              Manage inventory <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </div>

      <div className="panel dashboard-page__data-note">
        <div className="dashboard-page__data-icon">
          <ShieldCheck size={19} />
        </div>

        <div>
          <p>Your data stays with you</p>
          <span>
            Bluebird POS saves changes on this device, ready for the next
            shift.
          </span>
        </div>

        <Link
          href="/settings"
          data-testid="link-dashboard-settings"
        >
          Business settings <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
