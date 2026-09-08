import { notFound } from "next/navigation";
import { getProductById } from "@/lib/store/products";
import { updateProductAction, setProductActiveAction, setProductFeaturedAction } from "../actions";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const action = updateProductAction.bind(null, product.id, product.imageUrls);
  const toggleActive = setProductActiveAction.bind(null, product.id, !product.active);
  const toggleFeatured = setProductFeaturedAction.bind(null, product.id, !product.featured);

  return (
    <section className="admin-page">
      <div className="admin-page-head-row">
        <h1 className="display admin-page-heading">{product.name}</h1>
        <div className="admin-page-head-actions">
          <form action={toggleFeatured}>
            <button type="submit" className="admin-toggle-active-btn">
              {product.featured ? "remover destaque" : "marcar como destaque"}
            </button>
          </form>
          <form action={toggleActive}>
            <button type="submit" className="admin-toggle-active-btn">
              {product.active ? "desativar" : "ativar"}
            </button>
          </form>
        </div>
      </div>

      {product.featured && <p className="admin-featured-note">este é o produto em destaque da loja agora.</p>}

      {product.imageUrls.length > 0 && (
        <div className="admin-product-images">
          {product.imageUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
            <img key={url} src={url} alt={product.name} />
          ))}
        </div>
      )}

      <ProductForm
        action={action}
        defaultValues={{
          name: product.name,
          description: product.description,
          priceReais: (product.priceCents / 100).toFixed(2).replace(".", ","),
          category: product.category ?? "",
          supplierUrl: product.supplierUrl ?? "",
        }}
      />
    </section>
  );
}
