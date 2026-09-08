import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { getProductBySlug } from "@/lib/store/products";
import { formatBRL } from "@/lib/store/format";
import { BuyForm } from "./buy-form";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/loja">← voltar</Link>
      </header>

      <section className="product-detail">
        <div className="product-detail-media">
          {product.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
            <img src={product.imageUrls[0]} alt={product.name} />
          ) : (
            <div className="store-card-placeholder-cover" aria-hidden="true">
              <span className="initial">{product.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="display product-detail-name">{product.name}</h1>
          <p className="mono product-detail-price">{formatBRL(product.priceCents)}</p>
          {product.description && <p className="product-detail-description">{product.description}</p>}

          <BuyForm productId={product.id} />
        </div>
      </section>

      <Footer />
    </>
  );
}
