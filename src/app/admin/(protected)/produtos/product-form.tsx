"use client";

import { useActionState } from "react";
import type { ProductFormState } from "./actions";

export function ProductForm({
  action,
  defaultValues,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: {
    name: string;
    description: string;
    priceReais: string;
    category: string;
    supplierUrl: string;
  };
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  return (
    <form action={formAction} className="admin-product-form" encType="multipart/form-data">
      <label className="mono label" htmlFor="name">
        nome
      </label>
      <input id="name" name="name" defaultValue={defaultValues?.name} required />

      <label className="mono label" htmlFor="category">
        categoria (opcional)
      </label>
      <input
        id="category"
        name="category"
        placeholder="ex: eletrônicos, casa, acessórios"
        defaultValue={defaultValues?.category}
      />

      <label className="mono label" htmlFor="description">
        descrição
      </label>
      <textarea id="description" name="description" defaultValue={defaultValues?.description} rows={4} />

      <label className="mono label" htmlFor="priceReais">
        preço (R$)
      </label>
      <input
        id="priceReais"
        name="priceReais"
        placeholder="99,90"
        defaultValue={defaultValues?.priceReais}
        required
      />

      <label className="mono label" htmlFor="images">
        adicionar imagens
      </label>
      <input id="images" name="images" type="file" accept="image/*" multiple />

      <div className="admin-form-internal-section">
        <label className="mono label" htmlFor="supplierUrl">
          link de compra no fornecedor (uso interno — nunca aparece no site)
        </label>
        <input
          id="supplierUrl"
          name="supplierUrl"
          type="url"
          placeholder="https://..."
          defaultValue={defaultValues?.supplierUrl}
        />
      </div>

      {state?.error && <p className="buy-form-error">{state.error}</p>}

      <button type="submit" className="btn-solid" disabled={pending}>
        {pending ? "salvando..." : "salvar"}
      </button>
    </form>
  );
}
