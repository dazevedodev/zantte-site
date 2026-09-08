import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getProductBySlug, listActiveProducts } from "@/lib/store/products";
import { formatBRL } from "@/lib/store/format";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductGallery } from "./product-gallery";
import { ProductCard } from "../product-card";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await listActiveProducts();
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <section className="product-detail">
        <ProductGallery images={product.imageUrls} name={product.name} />

        <div className="product-detail-info">
          <h1 className="display product-detail-name">{product.name}</h1>
          <p className="product-detail-price">{formatBRL(product.priceCents)}</p>
          {product.description && <p className="product-detail-description">{product.description}</p>}

          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            imageUrl={product.imageUrls[0] ?? null}
          />
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <span className="label">mais produtos</span>
          <div className="store-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
