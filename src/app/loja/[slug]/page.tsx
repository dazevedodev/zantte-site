import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, listActiveProducts } from "@/lib/store/products";
import { discountPercent } from "@/lib/store/format";
import { ProductPurchase } from "./product-purchase";
import { ProductCard } from "../product-card";
import { StoreFooter } from "../store-footer";

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

  // "leve também" ao lado do botão de compra — prioriza um produto com
  // desconto de verdade cadastrado (mesma regra do upsell do carrinho),
  // pra ser um convite de oferta real, não empurrar qualquer coisa.
  const crossSell =
    others.find((p) => p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents) ?? others[0] ?? null;

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
        <ProductPurchase
          productId={product.id}
          slug={product.slug}
          name={product.name}
          category={product.category}
          description={product.description}
          priceCents={product.priceCents}
          compareAtPriceCents={product.compareAtPriceCents}
          images={product.imageUrls}
          videoUrl={product.videoUrl}
          variants={product.variants}
          unitsSold={product.unitsSold}
          shippingType={product.shippingType}
          discountPercent={
            product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
              ? discountPercent(product.compareAtPriceCents, product.priceCents)
              : null
          }
          crossSell={crossSell}
        />
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

      <StoreFooter />
    </>
  );
}
