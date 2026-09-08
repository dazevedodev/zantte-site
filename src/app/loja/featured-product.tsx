import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";

export function FeaturedProduct({ product }: { product: Product }) {
  return (
    <section className="featured-product">
      <div className="featured-product-media">
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
        <span className="label">produto em destaque</span>
        <h2 className="display featured-product-name">{product.name}</h2>
        {product.description && <p className="featured-product-description">{product.description}</p>}
        <p className="featured-product-price">{formatBRL(product.priceCents)}</p>
        <Link href={`/loja/${product.slug}`} className="btn-solid">
          ver produto
        </Link>
      </div>
    </section>
  );
}
