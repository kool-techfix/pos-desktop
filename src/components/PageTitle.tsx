import type { ReactNode } from 'react';
import './PageTitle.scss';

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-title__description">{description}</p>}
      </div>
      {action}
    </div>
  );
}
