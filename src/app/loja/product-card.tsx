import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL, discountPercent, formatSoldCount } from "@/lib/store/format";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const soldLabel = formatSoldCount(product.unitsSold);

  return (
    <Link href={`/loja/${product.slug}`} className="store-card">
      {hasDiscount && (
        <span className="sale-badge">
          -{discountPercent(product.compareAtPriceCents!, product.priceCents)}%
        </span>
      )}
      {product.imageUrls[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
        <img src={product.imageUrls[0]} alt={product.name} className="store-card-cover" />
      ) : (
        <div className="store-card-placeholder-cover" aria-hidden="true">
          <span className="initial">{product.name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="store-card-price-stack">
        {hasDiscount && (
          <span className="store-card-price-old">{formatBRL(product.compareAtPriceCents!)}</span>
        )}
        <span className={`store-card-price-tag ${hasDiscount ? "on-sale" : ""}`}>
          {formatBRL(product.priceCents)}
        </span>
      </div>
      <div className="store-card-info">
        {product.category && <span className="store-card-category">{product.category}</span>}
        <span className="store-card-name">{product.name}</span>
        {soldLabel && <span className="store-card-sold">{soldLabel}</span>}
      </div>
    </Link>
  );
}
