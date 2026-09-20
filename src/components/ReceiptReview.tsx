import { Printer } from 'lucide-react';

import { Modal } from '@/components/Modal';
import { printReceipt } from '@/lib/printer';
import type { Business, Sale } from '@/types/types';

import { ReceiptPrint } from './ReceiptPrint';
import './ReceiptReview.scss';

type ReceiptReviewProps = {
  sale: Sale;
  business: Business;
  onClose: () => void;
};

export function ReceiptReview({ sale, business, onClose }: ReceiptReviewProps) {
  return (
    <Modal title="Review receipt" onClose={onClose}>
      <div className="receipt-review">
        <p className="receipt-review__hint">
          Check the receipt before opening print setup.
        </p>

        <div className="receipt-review__paper">
          <ReceiptPrint sale={sale} business={business} preview />
        </div>

        <div className="receipt-review__actions">
          <button type="button" onClick={onClose} className="app-button">
            Cancel
          </button>

          <button
            type="button"
            onClick={() => { void printReceipt(sale, business); }}
            className="app-button app-button--primary"
          >
            <Printer size={15} aria-hidden="true" />
            Print receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}