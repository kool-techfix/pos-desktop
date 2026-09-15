import { useState } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import { PageTitle } from '@/components/PageTitle';
import { ReceiptPrint } from '@/components/ReceiptPrint';
import { dateOnly, dateTime, money } from '@/lib/helpers';
import type { AppState, Sale } from '@/types/types';
import './_page.scss';

export function SalesPage({ state }: { state: AppState }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Sale | null>(null);
  const sales = state.sales.filter((sale) => `${sale.receiptNumber} ${sale.cashierName}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="sales-page">
      <PageTitle eyebrow="Sales history" title="Every receipt, accounted for" description="Review transactions and reprint a customer receipt." />
      <section className="panel sales-page__panel">
        <div className="sales-page__toolbar"><div className="sales-page__search"><Search size={16} /><input data-testid="input-sales-search" placeholder="Search receipt or cashier..." value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
        <div className="sales-page__table-scroll">
          <table className="sales-page__table">
            <thead><tr><th>Receipt</th><th>Date & time</th><th>Cashier</th><th>Items</th><th>Total</th><th /></tr></thead>
            <tbody>{sales.map((sale) => <tr key={sale.id} data-testid={`row-sale-${sale.id}`}><td className="mono">{sale.receiptNumber}</td><td>{dateTime(sale.createdAt)}<small>{dateOnly(sale.createdAt)}</small></td><td>{sale.cashierName}</td><td className="muted">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td><strong>{money(sale.total)}</strong></td><td className="sales-page__view"><button data-testid={`button-view-sale-${sale.id}`} onClick={() => setSelected(sale)}>View receipt</button></td></tr>)}</tbody>
          </table>
        </div>
        {!sales.length && <div className="sales-page__empty"><EmptyState icon={FileText} title="No receipts found" body="Try a different search term." /></div>}
      </section>
      {selected && <Modal title={selected.receiptNumber} onClose={() => setSelected(null)}>
        <div className="sales-page__detail">
          <div className="sales-page__detail-meta"><span>{dateTime(selected.createdAt)}</span><span>{selected.cashierName}</span></div>
          <div className="sales-page__detail-items">{selected.items.map((item) => <div key={item.productId}><span>{item.quantity} × {item.name}<small>{item.size}</small></span><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}</div>
          <div className="sales-page__detail-total"><div><span>Total</span><strong>{money(selected.total)}</strong></div><div><span>Paid</span><span>{money(selected.amountPaid)}</span></div><div><span>Change</span><span>{money(selected.change)}</span></div></div>
          <button data-testid="button-reprint-receipt" onClick={() => window.print()} className="app-button app-button--primary sales-page__print"><Printer size={15} />Print receipt</button>
          <ReceiptPrint sale={selected} business={state.business} />
        </div>
      </Modal>}
    </div>
  );
}
