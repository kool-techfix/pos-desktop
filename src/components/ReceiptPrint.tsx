import { dateTime, money } from '@/lib/helpers';
import type { Business, Sale } from '@/types/types';

import './ReceiptPrint.scss';

type ReceiptPrintProps = {
  sale: Sale;
  business: Business;
  preview?: boolean;
};

export function ReceiptPrint({
  sale,
  business,
  preview = false,
}: ReceiptPrintProps) {
  return (
    <div className={preview ? "receipt-preview" : "print-receipt"}>
      <div className="receipt-paper">
        <strong className="receipt-business-name">{business.name}</strong>

        <br />

        Receipt {sale.receiptNumber}

        <br />

        {dateTime(sale.createdAt)}

        <hr />

        {sale.items.map((item) => (
          <div className="receipt-item" key={item.productId}>
            <div className="receipt-item-name">
              {item.quantity} x {item.name}
              {item.size && <span className="receipt-item-size"> ({item.size})</span>}
            </div>

            <div className="receipt-item-price">
              {money(item.unitPrice * item.quantity)}
            </div>
          </div>
        ))}

        <hr />

        <div>
          TOTAL {money(sale.total)}
        </div>

        <div>
          PAID {money(sale.amountPaid)}
        </div>

        <div>
          CHANGE {money(sale.change)}
        </div>

        <br />

        <div>
          Cashier: {sale.cashierName}
        </div>
      </div>
    </div>
  );
}