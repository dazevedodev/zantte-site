import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/loja/${product.slug}`} className="store-card">
      {product.imageUrls[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
        <img src={product.imageUrls[0]} alt={product.name} className="store-card-cover" />
      ) : (
        <div className="store-card-placeholder-cover" aria-hidden="true">
          <span className="initial">{product.name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="store-card-info">
        <span className="store-card-name">{product.name}</span>
        <span className="store-card-price-row">
          {product.compareAtPriceCents && (
            <span className="store-card-price-compare">{formatBRL(product.compareAtPriceCents)}</span>
          )}
          <span className="store-card-price">{formatBRL(product.priceCents)}</span>
        </span>
      </div>
    </Link>
  );
}
