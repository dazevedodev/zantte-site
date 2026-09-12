"use client";

import { useActionState, useState } from "react";
import type { ProductFormState } from "./actions";
import type { ProductVariant, ShippingType } from "@/lib/store/types";

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
    videoUrl: string;
    variants: ProductVariant[];
    unitsSold: string;
    shippingType: ShippingType | null;
    weightGrams: string;
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    dropDeliveryDays: string;
  };
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);
  const [images, setImages] = useState<string[]>(defaultValues?.imageUrls ?? []);
  const [existingVideoUrl, setExistingVideoUrl] = useState(defaultValues?.videoUrl ?? "");
  const [variants, setVariants] = useState<ProductVariant[]>(defaultValues?.variants ?? []);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantImage, setNewVariantImage] = useState("");
  const [shippingType, setShippingType] = useState<ShippingType | "">(defaultValues?.shippingType ?? "");

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

  function addVariant() {
    if (!newVariantName.trim() || !newVariantImage) return;
    setVariants((prev) => [...prev, { name: newVariantName.trim(), imageUrl: newVariantImage }]);
    setNewVariantName("");
    setNewVariantImage("");
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="admin-product-form" encType="multipart/form-data">
      <input type="hidden" name="existingImageUrls" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

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

      <label className="mono label" htmlFor="unitsSold">
        unidades já vendidas (opcional — só número real, aparece como prova social)
      </label>
      <input
        id="unitsSold"
        name="unitsSold"
        type="number"
        min={0}
        placeholder="ex: 57 (deixa em branco ou 0 se não quiser mostrar)"
        defaultValue={defaultValues?.unitsSold}
      />

      <div className="admin-shipping-manager">
        <span className="mono label">envio</span>

        <label className="mono label" htmlFor="shippingType">
          quem despacha
        </label>
        <select
          id="shippingType"
          name="shippingType"
          value={shippingType}
          onChange={(e) => setShippingType(e.target.value as ShippingType | "")}
        >
          <option value="">— escolher —</option>
          <option value="own">a própria zantte envia</option>
          <option value="drop">fornecedor envia (dropshipping)</option>
        </select>

        {shippingType === "own" && (
          <div className="admin-shipping-dimensions">
            <p className="admin-form-hint">
              peso e dimensões da caixa fechada — usados pra calcular o frete real via Melhor Envio.
            </p>
            <div className="admin-form-row-4">
              <div className="admin-form-row-4-field">
                <label className="mono label" htmlFor="weightGrams">
                  peso (g)
                </label>
                <input
                  id="weightGrams"
                  name="weightGrams"
                  type="number"
                  min={1}
                  placeholder="ex: 300"
                  defaultValue={defaultValues?.weightGrams}
                />
              </div>
              <div className="admin-form-row-4-field">
                <label className="mono label" htmlFor="lengthCm">
                  comprimento (cm)
                </label>
                <input
                  id="lengthCm"
                  name="lengthCm"
                  type="number"
                  min={1}
                  placeholder="ex: 20"
                  defaultValue={defaultValues?.lengthCm}
                />
              </div>
              <div className="admin-form-row-4-field">
                <label className="mono label" htmlFor="widthCm">
                  largura (cm)
                </label>
                <input
                  id="widthCm"
                  name="widthCm"
                  type="number"
                  min={1}
                  placeholder="ex: 15"
                  defaultValue={defaultValues?.widthCm}
                />
              </div>
              <div className="admin-form-row-4-field">
                <label className="mono label" htmlFor="heightCm">
                  altura (cm)
                </label>
                <input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  min={1}
                  placeholder="ex: 10"
                  defaultValue={defaultValues?.heightCm}
                />
              </div>
            </div>
          </div>
        )}

        {shippingType === "drop" && (
          <>
            <label className="mono label" htmlFor="dropDeliveryDays">
              prazo de entrega do fornecedor (frete sempre grátis)
            </label>
            <input
              id="dropDeliveryDays"
              name="dropDeliveryDays"
              placeholder="ex: 15 a 25 dias úteis"
              defaultValue={defaultValues?.dropDeliveryDays}
            />
          </>
        )}
      </div>

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

      <input type="hidden" name="existingVideoUrl" value={existingVideoUrl} />
      <input type="hidden" name="removeVideo" value={existingVideoUrl ? "false" : "true"} />
      <label className="mono label" htmlFor="video">
        vídeo do produto (opcional)
      </label>
      {existingVideoUrl && (
        <div className="admin-video-preview">
          <video src={existingVideoUrl} controls />
          <button type="button" onClick={() => setExistingVideoUrl("")}>
            remover vídeo
          </button>
        </div>
      )}
      <input id="video" name="video" type="file" accept="video/*" />

      <div className="admin-variant-manager">
        <span className="mono label">variações de cor (opcional — cliente escolhe e a foto troca)</span>

        {variants.length > 0 && (
          <div className="admin-variant-manager-list">
            {variants.map((variant, i) => (
              <div key={`${variant.name}-${i}`} className="admin-variant-manager-item">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview de imagem já hospedada no Blob. */}
                <img src={variant.imageUrl} alt="" />
                <span>{variant.name}</span>
                <button type="button" onClick={() => removeVariant(i)}>
                  excluir
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 ? (
          <div className="admin-variant-add-row">
            <input
              placeholder="nome da cor (ex: Vermelho)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
            />
            <div className="admin-variant-image-picker">
              {images.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`admin-variant-image-option ${newVariantImage === url ? "active" : ""}`}
                  onClick={() => setNewVariantImage(url)}
                  aria-label="usar essa foto pra variação"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview de imagem já hospedada no Blob. */}
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              disabled={!newVariantName.trim() || !newVariantImage}
            >
              + adicionar variação
            </button>
          </div>
        ) : (
          <p className="admin-form-hint">adicione fotos primeiro pra poder criar variações de cor.</p>
        )}
      </div>

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
