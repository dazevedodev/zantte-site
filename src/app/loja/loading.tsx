export default function LojaLoading() {
  return (
    <div className="store-skeleton" aria-hidden="true">
      <div className="store-skeleton-hero">
        <div className="store-skeleton-block store-skeleton-eyebrow" />
        <div className="store-skeleton-block store-skeleton-title" />
        <div className="store-skeleton-block store-skeleton-line" />
      </div>
      <div className="store-skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="store-skeleton-card" />
        ))}
      </div>
    </div>
  );
}
