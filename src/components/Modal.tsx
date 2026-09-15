import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.scss';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal">
      <div className="modal__dialog">
        <div className="modal__header">
          <h2>{title}</h2>
          <button data-testid="button-close-modal" onClick={onClose} className="modal__close" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
