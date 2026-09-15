import { dateTime, money } from '@/lib/helpers';
import type { Business, Sale } from '@/types';
import './ReceiptPrint.scss';

export function ReceiptPrint({ sale, business }: { sale: Sale; business: Business }) {
  return (
    <div className="print-receipt">
      <div className="receipt-paper">
        <strong>{business.name}</strong>
        <br />
        Receipt {sale.receiptNumber}
        <br />
        {dateTime(sale.createdAt)}
        <hr />
        {sale.items.map((item) => (
          <div key={item.productId}>
            {item.quantity} x {item.name} {money(item.unitPrice * item.quantity)}
            <br />
            <span>{item.size}</span>
          </div>
        ))}
        <hr />
        TOTAL {money(sale.total)}
        <br />
        PAID {money(sale.amountPaid)}
        <br />
        CHANGE {money(sale.change)}
        <br />
        <br />
        Cashier: {sale.cashierName}
      </div>
    </div>
  );
}
