"use client";

import { useActionState } from "react";
import type { ProductFormState } from "./actions";

export function ProductForm({
  action,
  defaultValues,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: { name: string; description: string; priceReais: string };
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  return (
    <form action={formAction} className="admin-product-form" encType="multipart/form-data">
      <label className="mono label" htmlFor="name">
        nome
      </label>
      <input id="name" name="name" defaultValue={defaultValues?.name} required />

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

      {state?.error && <p className="buy-form-error">{state.error}</p>}

      <button type="submit" className="btn-solid" disabled={pending}>
        {pending ? "salvando..." : "salvar"}
      </button>
    </form>
  );
}
