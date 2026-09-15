import type { LucideIcon } from 'lucide-react';
import './EmptyState.scss';

export function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="empty-state">
      <Icon size={25} />
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__body">{body}</p>
    </div>
  );
}
