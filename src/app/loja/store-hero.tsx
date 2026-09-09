import Link from "next/link";
import type { Product } from "@/lib/store/types";

export function StoreHero({ products, featured }: { products: Product[]; featured: Product | null }) {
  const rest = products.filter((p) => p.id !== featured?.id);
  const tiles = [...(featured ? [featured] : []), ...rest].slice(0, 3);

  return (
    <section className="store-hero">
      <div className="store-hero-copy">
        <span className="store-hero-eyebrow">loja oficial da zantte</span>
        <h1 className="store-hero-mark">
          ZAN<span className="co">&nbsp;CO.</span>
        </h1>
        <p className="store-hero-tagline">Produtos selecionados, direto pra sua casa.</p>
        <a href="#catalogo" className="store-hero-cta">
          ver produtos ↓
        </a>
      </div>

      {tiles.length > 0 && (
        <div className="store-hero-mosaic">
          {tiles.map((p, i) => (
            <Link key={p.id} href={`/loja/${p.slug}`} className={`store-hero-tile store-hero-tile-${i}`}>
              {featured?.id === p.id && <span className="store-hero-tile-badge">destaque</span>}
              <div className="store-hero-tile-frame">
                {p.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
                  <img src={p.imageUrls[0]} alt={p.name} />
                ) : (
                  <div className="store-card-placeholder-cover" aria-hidden="true">
                    <span className="initial">{p.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="store-hero-tile-name">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
