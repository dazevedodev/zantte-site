import Link from "next/link";
import { Footer } from "@/components/footer";
import { listActiveProducts } from "@/lib/store/products";
import { formatBRL } from "@/lib/store/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Loja — Zantte" };

export default async function LojaPage() {
  const products = await listActiveProducts();

  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/" className="mono">
          ← zantte
        </Link>
      </header>

      <section className="store-page">
        <div className="store-head">
          <span className="mono label">loja</span>
          <h1 className="display store-heading">produtos</h1>
        </div>

        <div className="store-grid">
          {products.map((p) => (
            <Link key={p.id} href={`/loja/${p.slug}`} className="store-card">
              {p.imageUrls[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
                <img src={p.imageUrls[0]} alt={p.name} className="store-card-cover" />
              ) : (
                <div className="store-card-placeholder-cover" aria-hidden="true">
                  <span className="initial">{p.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="store-card-info">
                <span className="store-card-name">{p.name}</span>
                <span className="mono store-card-price">{formatBRL(p.priceCents)}</span>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <div className="project-grid-empty mono">
              <span className="plus">+</span>
              <span>em breve</span>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
