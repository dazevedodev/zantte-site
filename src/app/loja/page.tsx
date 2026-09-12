import { listActiveProducts, getFeaturedProduct } from "@/lib/store/products";
import { StoreGrid } from "./store-grid";
import { StoreHero } from "./store-hero";
import { WhyBuy } from "./why-buy";
import { StoreFooter } from "./store-footer";

export const dynamic = "force-dynamic";
export const metadata = { title: "ZAN CO. — Loja Zantte" };

export default async function LojaPage() {
  const [products, featured] = await Promise.all([listActiveProducts(), getFeaturedProduct()]);

  return (
    <>
      <StoreHero products={products} featured={featured} />

      <WhyBuy />

      <section className="store-page" id="catalogo">
        <StoreGrid products={products} />
      </section>

      <StoreFooter />
    </>
  );
}
