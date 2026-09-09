import { notFound } from "next/navigation";
import { getProductById } from "@/lib/store/products";
import { updateProductAction, setProductActiveAction, setProductFeaturedAction } from "../actions";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-product-button";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const action = updateProductAction.bind(null, product.id);
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
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>

      {product.featured && <p className="admin-featured-note">este é o produto em destaque da loja agora.</p>}

      <ProductForm
        action={action}
        defaultValues={{
          name: product.name,
          description: product.description,
          priceReais: (product.priceCents / 100).toFixed(2).replace(".", ","),
          compareAtPriceReais: product.compareAtPriceCents
            ? (product.compareAtPriceCents / 100).toFixed(2).replace(".", ",")
            : "",
          category: product.category ?? "",
          supplierUrl: product.supplierUrl ?? "",
          imageUrls: product.imageUrls,
        }}
      />
    </section>
  );
}
