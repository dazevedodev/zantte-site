import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL, discountPercent } from "@/lib/store/format";

const DESCRIPTION_LIMIT = 130;

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}…`;
}

export function FeaturedProduct({ product }: { product: Product }) {
  const hasDiscount = product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;

  return (
    <section className="featured-product">
      <div className="featured-product-media">
        {hasDiscount && (
          <span className="sale-badge">
            -{discountPercent(product.compareAtPriceCents!, product.priceCents)}%
          </span>
        )}
        {product.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
          <img src={product.imageUrls[0]} alt={product.name} />
        ) : (
          <div className="store-card-placeholder-cover" aria-hidden="true">
            <span className="initial">{product.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="featured-product-info">
        <span className="store-hero-eyebrow">em destaque</span>
        <h2 className="display featured-product-name">{product.name}</h2>
        {product.description && (
          <p className="featured-product-description">{truncate(product.description, DESCRIPTION_LIMIT)}</p>
        )}
        <p className="featured-product-price-row">
          {hasDiscount && (
            <span className="featured-product-price-compare">{formatBRL(product.compareAtPriceCents!)}</span>
          )}
          <span className="featured-product-price">{formatBRL(product.priceCents)}</span>
        </p>
        <Link href={`/loja/${product.slug}`} className="btn-solid">
          ver produto
        </Link>
      </div>
    </section>
  );
}
