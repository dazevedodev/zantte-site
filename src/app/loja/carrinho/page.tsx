"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { formatBRL, formatCep } from "@/lib/store/format";
import { createCartOrderAction, type CartCheckoutState } from "./actions";

type ViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export default function CarrinhoPage() {
  const { items, removeItem, setQuantity, totalCents } = useCart();
  const [state, formAction, pending] = useActionState<CartCheckoutState, FormData>(
    createCartOrderAction,
    null,
  );

  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepLookupFailed, setCepLookupFailed] = useState(false);

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as ViaCep;
      if (data.erro) {
        setCepLookupFailed(true);
        return;
      }
      setCepLookupFailed(false);
      setAddress({
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      });
    } catch {
      setCepLookupFailed(true);
    }
  }

  const cartJson = JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <h1 className="display cart-heading">carrinho</h1>
        <p className="cart-empty">
          seu carrinho está vazio. <Link href="/loja">ver produtos →</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1 className="display cart-heading">carrinho</h1>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.productId} className="cart-item">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
              <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
            ) : (
              <div className="cart-item-image cart-item-image-placeholder" aria-hidden="true">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="cart-item-info">
              <Link href={`/loja/${item.slug}`} className="cart-item-name">
                {item.name}
              </Link>
              <span className="cart-item-price">{formatBRL(item.priceCents)}</span>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
              className="cart-item-quantity"
            />
            <button
              type="button"
              className="cart-item-remove"
              onClick={() => removeItem(item.productId)}
              aria-label={`remover ${item.name}`}
            >
              remover
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>total</span>
        <span className="cart-summary-total">{formatBRL(totalCents)}</span>
      </div>

      <form action={formAction} className="buy-form">
        <input type="hidden" name="cartJson" value={cartJson} />

        <fieldset className="buy-form-fieldset">
          <legend className="label">contato</legend>
          <input name="customerName" placeholder="nome completo" required />
          <input name="customerEmail" type="email" placeholder="e-mail" required />
          <input name="customerPhone" placeholder="telefone (com DDD)" required />
          <input name="customerCpf" placeholder="CPF (só números)" required />
        </fieldset>

        <fieldset className="buy-form-fieldset">
          <legend className="label">endereço de entrega</legend>
          <input
            name="shippingCep"
            placeholder="CEP"
            required
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            onBlur={handleCepBlur}
          />
          {cepLookupFailed && (
            <p className="buy-form-hint">não encontramos esse CEP, preenche o endereço manualmente</p>
          )}
          <input
            name="shippingStreet"
            placeholder="rua"
            required
            value={address.street}
            onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
          />
          <div className="buy-form-row-split">
            <input name="shippingNumber" placeholder="número" required />
            <input name="shippingComplement" placeholder="complemento (opcional)" />
          </div>
          <input
            name="shippingNeighborhood"
            placeholder="bairro"
            required
            value={address.neighborhood}
            onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
          />
          <div className="buy-form-row-split">
            <input
              name="shippingCity"
              placeholder="cidade"
              required
              value={address.city}
              onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
            />
            <input
              name="shippingState"
              placeholder="UF"
              maxLength={2}
              required
              value={address.state}
              onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
            />
          </div>
        </fieldset>

        {state?.error && <p className="buy-form-error">{state.error}</p>}

        <button type="submit" className="btn-solid" disabled={pending}>
          {pending ? "processando..." : "ir para o pagamento"}
        </button>
      </form>
    </section>
  );
}
