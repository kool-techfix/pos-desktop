import './BrandMark.scss';

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand-mark ${light ? 'brand-mark--light' : ''}`}>
      <div className="brand-mark__inner" />
    </div>
  );
}
