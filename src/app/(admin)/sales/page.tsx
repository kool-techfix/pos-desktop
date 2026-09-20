"use client";

import { useMemo, useState } from "react";

import { FileText, Printer, Search } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import { PageTitle } from "@/components/PageTitle";
import { ReceiptPrint } from "@/components/ReceiptPrint";

import { dateOnly, dateTime, money } from "@/lib/helpers";
import { printReceipt } from "@/lib/printer";
import type { Business, Sale } from "@/types/types";

import "./_page.scss";
import { useApp } from "@/providers/AppProvider";

export default function SalesPage() {
  const { state } = useApp();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Sale | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const sales = useMemo(() => {
    if (!normalizedQuery) {
      return state.sales;
    }

    return state.sales.filter((sale) =>
      `${sale.receiptNumber} ${sale.cashierName}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [state.sales, normalizedQuery]);

  return (
    <div className="sales-page">
      <PageTitle
        eyebrow="Sales history"
        title="Every receipt, accounted for"
        description="Review transactions and reprint a customer receipt."
      />

      <section className="panel sales-page__panel">
        <div className="sales-page__toolbar">
          <div className="sales-page__search">
            <Search size={16} aria-hidden="true" />

            <input
              data-testid="input-sales-search"
              type="search"
              placeholder="Search receipt or cashier..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search sales"
            />
          </div>
        </div>

        {sales.length > 0 ? (
          <div className="sales-page__table-scroll">
            <table className="sales-page__table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Date & time</th>
                  <th>Cashier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <SaleRow
                    key={sale.id}
                    sale={sale}
                    onView={() => setSelected(sale)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sales-page__empty">
            <EmptyState
              icon={FileText}
              title="No receipts found"
              body={
                normalizedQuery
                  ? "Try a different search term."
                  : "No sales have been recorded yet."
              }
            />
          </div>
        )}
      </section>

      {selected && (
        <SaleReceiptModal
          sale={selected}
          business={state.business}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

type SaleRowProps = {
  sale: Sale;
  onView: () => void;
};

function SaleRow({ sale, onView }: SaleRowProps) {
  const itemCount = sale.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <tr data-testid={`row-sale-${sale.id}`}>
      <td className="mono">{sale.receiptNumber}</td>

      <td>
        {dateTime(sale.createdAt)}
        <small>{dateOnly(sale.createdAt)}</small>
      </td>

      <td>{sale.cashierName}</td>

      <td className="muted">{itemCount}</td>

      <td>
        <strong>{money(sale.total)}</strong>
      </td>

      <td className="sales-page__view">
        <button
          type="button"
          data-testid={`button-view-sale-${sale.id}`}
          onClick={onView}
        >
          View receipt
        </button>
      </td>
    </tr>
  );
}

type SaleReceiptModalProps = {
  sale: Sale;
  business: Business;
  onClose: () => void;
};

function SaleReceiptModal({
  sale,
  business,
  onClose,
}: SaleReceiptModalProps) {
  return (
    <Modal title={sale.receiptNumber} onClose={onClose}>
      <div className="sales-page__detail">
        <div className="sales-page__detail-meta">
          <span>{dateTime(sale.createdAt)}</span>
          <span>{sale.cashierName}</span>
        </div>

        <div className="sales-page__detail-items">
          {sale.items.map((item) => (
            <div key={item.productId}>
              <span>
                {item.quantity} × {item.name}
                <small>{item.size}</small>
              </span>

              <strong>
                {money(item.unitPrice * item.quantity)}
              </strong>
            </div>
          ))}
        </div>

        <div className="sales-page__detail-total">
          <div>
            <span>Total</span>
            <strong>{money(sale.total)}</strong>
          </div>

          <div>
            <span>Paid</span>
            <span>{money(sale.amountPaid)}</span>
          </div>

          <div>
            <span>Change</span>
            <span>{money(sale.change)}</span>
          </div>
        </div>

        <button
          type="button"
          data-testid="button-reprint-receipt"
          onClick={() => { void printReceipt(sale, business); }}
          className="app-button app-button--primary sales-page__print"
        >
          <Printer size={15} aria-hidden="true" />
          Print receipt
        </button>

        <ReceiptPrint sale={sale} business={business} />
      </div>
    </Modal>
  );
}
