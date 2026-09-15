import type { LucideIcon } from 'lucide-react';
import './Metric.scss';

export function Metric({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone?: 'gold' | 'red' | 'green';
}) {
  return (
    <div className="metric panel">
      <div className="metric__top">
        <span className="eyebrow">{label}</span>
        <Icon className={`metric__icon metric__icon--${tone ?? 'blue'}`} size={18} />
      </div>
      <p data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="metric__value">{value}</p>
      <p className="metric__note">{note}</p>
    </div>
  );
}
