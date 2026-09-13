import Link from "next/link";
import type { Product } from "@/lib/store/types";

// Composição editorial de 1 produto só (o destaque), com bastante respiro
// em volta — em vez de espremer 3 fotos num mosaico, que fica ilegível no
// mobile e não passa sensação premium.
export function StoreHero({ products, featured }: { products: Product[]; featured: Product | null }) {
  const spotlight = featured ?? products[0] ?? null;

  return (
    <section className="store-hero">
      <div className="store-hero-copy">
        <span className="store-hero-eyebrow">loja oficial da zantte</span>
        <h1 className="store-hero-mark display">
          ZAN<span className="co">&nbsp;CO.</span>
        </h1>
        <p className="store-hero-tagline">Produtos selecionados, direto pra sua casa.</p>
        <a href="#loja-toolbar" className="store-hero-cta">
          ver produtos
        </a>
      </div>

      {spotlight && (
        <div className="store-hero-spotlight">
          <span className="store-hero-spotlight-badge">produto em alta</span>
          <div className="store-hero-spotlight-frame">
            {spotlight.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
              <img src={spotlight.imageUrls[0]} alt={spotlight.name} />
            ) : (
              <div className="store-card-placeholder-cover" aria-hidden="true">
                <span className="initial">{spotlight.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <span className="store-hero-spotlight-name">{spotlight.name}</span>
          <Link href={`/loja/${spotlight.slug}`} className="store-hero-spotlight-cta">
            ver produto
          </Link>
        </div>
      )}
    </section>
  );
}
