import { Footer } from "@/components/footer";
import { listActiveProducts, getFeaturedProduct } from "@/lib/store/products";
import { StoreGrid } from "./store-grid";
import { FeaturedProduct } from "./featured-product";

export const dynamic = "force-dynamic";
export const metadata = { title: "ZAN CO. — Loja Zantte" };

export default async function LojaPage() {
  const [products, featured] = await Promise.all([listActiveProducts(), getFeaturedProduct()]);

  return (
    <>
      <section className="store-hero">
        <span className="label">loja oficial da zantte</span>
        <h1 className="store-hero-mark">
          ZAN<span className="co">&nbsp;CO.</span>
        </h1>
        <p className="store-hero-tagline">Produtos selecionados, direto pra sua casa.</p>
      </section>

      {featured && <FeaturedProduct product={featured} />}

      <section className="store-page">
        <StoreGrid products={products} />
      </section>

      <Footer />
    </>
  );
}
