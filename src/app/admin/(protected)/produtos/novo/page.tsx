import { createProductAction } from "../actions";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <section className="admin-page">
      <h1 className="display admin-page-heading">novo produto</h1>
      <ProductForm action={createProductAction} />
    </section>
  );
}
