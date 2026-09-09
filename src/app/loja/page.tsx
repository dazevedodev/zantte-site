import { Footer } from "@/components/footer";
import { listActiveProducts, getFeaturedProduct } from "@/lib/store/products";
import { StoreGrid } from "./store-grid";
import { StoreHero } from "./store-hero";
import { FeaturedProduct } from "./featured-product";

export const dynamic = "force-dynamic";
export const metadata = { title: "ZAN CO. — Loja Zantte" };

export default async function LojaPage() {
  const [products, featured] = await Promise.all([listActiveProducts(), getFeaturedProduct()]);

  return (
    <>
      <StoreHero spotlight={products} />

      <section className="store-page" id="catalogo">
        <StoreGrid products={products} />
      </section>

      {featured && <FeaturedProduct product={featured} />}

      <Footer />
    </>
  );
}
