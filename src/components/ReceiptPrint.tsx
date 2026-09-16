import { dateTime, money } from '@/lib/helpers';
import type { Business, Sale } from '@/types/types';

import './ReceiptPrint.scss';

type ReceiptPrintProps = {
  sale: Sale;
  business: Business;
};

export function ReceiptPrint({
  sale,
  business,
}: ReceiptPrintProps) {
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
            <div>
              {item.quantity} × {item.name}
            </div>

            <div>
              {money(item.unitPrice * item.quantity)}
            </div>

            {item.size && <span>{item.size}</span>}
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