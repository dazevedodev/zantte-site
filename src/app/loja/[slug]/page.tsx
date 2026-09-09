import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getProductBySlug, listActiveProducts } from "@/lib/store/products";
import { formatBRL, discountPercent } from "@/lib/store/format";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductGallery } from "./product-gallery";
import { ProductDescription } from "./product-description";
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
  const others = allProducts.filter((p) => p.id !== product.id);
  // prioriza produtos da mesma categoria — "mais produtos" precisa ser um
  // convite pra comprar outro item parecido, não qualquer coisa do catálogo.
  const sameCategory = product.category ? others.filter((p) => p.category === product.category) : [];
  const rest = others.filter((p) => !sameCategory.includes(p));
  const relatedProducts = [...sameCategory, ...rest].slice(0, 4);
  const relatedLabel =
    sameCategory.length > 0 ? `mais em ${product.category}` : "você também pode gostar";

  return (
    <>
      <nav className="product-breadcrumb mono" aria-label="breadcrumb">
        <Link href="/loja">loja</Link>
        {product.category && (
          <>
            <span>/</span>
            <span>{product.category}</span>
          </>
        )}
        <span>/</span>
        <span className="product-breadcrumb-current">{product.name}</span>
      </nav>

      <section className="product-detail">
        <ProductGallery
          images={product.imageUrls}
          name={product.name}
          discountPercent={
            product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
              ? discountPercent(product.compareAtPriceCents, product.priceCents)
              : null
          }
        />

        <div className="product-detail-info">
          <h1 className="display product-detail-name">{product.name}</h1>
          <p className="product-detail-price-row">
            {product.compareAtPriceCents && (
              <span className="product-detail-price-compare">{formatBRL(product.compareAtPriceCents)}</span>
            )}
            <span className="product-detail-price">{formatBRL(product.priceCents)}</span>
          </p>
          {product.description && <ProductDescription text={product.description} />}

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
          <span className="label">{relatedLabel}</span>
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
