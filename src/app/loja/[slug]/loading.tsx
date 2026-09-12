export default function ProductLoading() {
  return (
    <div className="store-skeleton store-skeleton-product" aria-hidden="true">
      <div className="store-skeleton-block store-skeleton-media" />
      <div className="store-skeleton-info">
        <div className="store-skeleton-block store-skeleton-title" />
        <div className="store-skeleton-block store-skeleton-price" />
        <div className="store-skeleton-block store-skeleton-line" />
        <div className="store-skeleton-block store-skeleton-line" />
      </div>
    </div>
  );
}
