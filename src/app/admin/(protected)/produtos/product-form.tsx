"use client";

import { useActionState, useState } from "react";
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
    compareAtPriceReais: string;
    category: string;
    supplierUrl: string;
    imageUrls: string[];
  };
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);
  const [images, setImages] = useState<string[]>(defaultValues?.imageUrls ?? []);

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="admin-product-form" encType="multipart/form-data">
      <input type="hidden" name="existingImageUrls" value={JSON.stringify(images)} />

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
        preço de venda (R$)
      </label>
      <input
        id="priceReais"
        name="priceReais"
        placeholder="99,90"
        defaultValue={defaultValues?.priceReais}
        required
      />

      <label className="mono label" htmlFor="compareAtPriceReais">
        preço &quot;de&quot; riscado (opcional — pra mostrar como promoção)
      </label>
      <input
        id="compareAtPriceReais"
        name="compareAtPriceReais"
        placeholder="ex: 129,90 (deixa em branco se não tiver promoção)"
        defaultValue={defaultValues?.compareAtPriceReais}
      />

      {images.length > 0 && (
        <div className="admin-image-manager">
          <span className="mono label">fotos (a 1ª é a capa)</span>
          <div className="admin-image-manager-list">
            {images.map((url, i) => (
              <div key={url} className="admin-image-manager-item">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview de imagem já hospedada no Blob. */}
                <img src={url} alt="" />
                <div className="admin-image-manager-controls">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="mover pra esquerda">
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="mover pra direita"
                  >
                    →
                  </button>
                  <button type="button" onClick={() => removeImage(i)} aria-label="remover foto">
                    excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="mono label" htmlFor="images">
        adicionar novas imagens
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
