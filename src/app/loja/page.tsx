import Link from "next/link";
import { Footer } from "@/components/footer";
import { listActiveProducts } from "@/lib/store/products";
import { StoreGrid } from "./store-grid";

export const dynamic = "force-dynamic";
export const metadata = { title: "ZAN CO. — Loja Zantte" };

export default async function LojaPage() {
  const products = await listActiveProducts();

  return (
    <div className="store-theme">
      <header className="portfolio-page-header">
        <Link href="/">← voltar</Link>
      </header>

      <section className="store-hero">
        <span className="label">loja oficial da zantte</span>
        <h1 className="store-hero-mark">
          ZAN<span className="co">&nbsp;CO.</span>
        </h1>
        <p className="store-hero-tagline">Produtos selecionados, direto pra sua casa.</p>
      </section>

      <section className="store-page">
        <StoreGrid products={products} />
      </section>

      <Footer />
    </div>
  );
}
