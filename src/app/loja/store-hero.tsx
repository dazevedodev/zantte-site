import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL, formatSoldCount } from "@/lib/store/format";

// Capa centralizada: "ZAN CO." em cima, o mascote da loja no meio como
// protagonista (com 2-3 produtos reais "flutuando" ao redor, tipo
// vitrine), botão embaixo de tudo. Desenhada e aprovada junto com ela
// num protótipo antes de entrar aqui.
export function StoreHero({ products, featured }: { products: Product[]; featured: Product | null }) {
  const withPhoto = products.filter((p) => p.imageUrls[0]);
  const spotlight = featured ?? withPhoto[0] ?? null;
  // produtos pra "vitrine" ao redor do mascote — evita repetir o spotlight,
  // que já aparece em destaque na página de produto dele mesmo.
  const showcase = withPhoto.filter((p) => p.id !== spotlight?.id).slice(0, 3);
  const soldLabel = spotlight ? formatSoldCount(spotlight.unitsSold) : null;

  return (
    <section className="store-hero">
      <h1 className="store-hero-mark display">
        ZAN <span className="co">CO.</span>
      </h1>

      <div className="store-hero-stage">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
        <img src="/icons/mascot-zanco.png" alt="" className="store-hero-mascot" />
        {/* desvanece o rodapé reto da foto no fundo da loja, em vez de um corte seco */}
        <div className="store-hero-mascot-fade" aria-hidden="true" />

        {showcase[0] && (
          <Link href={`/loja/${showcase[0].slug}`} className="store-hero-float-card card-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
            <img src={showcase[0].imageUrls[0]} alt={showcase[0].name} />
            <span>{formatBRL(showcase[0].priceCents)}</span>
          </Link>
        )}

        {showcase[1] && (
          <Link href={`/loja/${showcase[1].slug}`} className="store-hero-float-card card-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
            <img src={showcase[1].imageUrls[0]} alt={showcase[1].name} />
            <span>{formatBRL(showcase[1].priceCents)}</span>
          </Link>
        )}

        {showcase[2] && (
          <Link href={`/loja/${showcase[2].slug}`} className="store-hero-float-card card-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
            <img src={showcase[2].imageUrls[0]} alt={showcase[2].name} />
            <span>{formatBRL(showcase[2].priceCents)}</span>
          </Link>
        )}

        {soldLabel && (
          <Link href={spotlight ? `/loja/${spotlight.slug}` : "#loja-toolbar"} className="store-hero-badge">
            {soldLabel}
          </Link>
        )}
      </div>

      <a href="#loja-toolbar" className="store-hero-cta">
        ver produtos
      </a>
    </section>
  );
}
