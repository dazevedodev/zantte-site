"use client";

import { useActionState, useState } from "react";
import { createOrderAction, type BuyFormState } from "../actions";
import { formatCep } from "@/lib/store/format";

type ViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export function BuyForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<BuyFormState, FormData>(
    createOrderAction,
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

  return (
    <form action={formAction} className="buy-form">
      <input type="hidden" name="productId" value={productId} />

      <div className="buy-form-row">
        <label className="mono label" htmlFor="quantity">
          quantidade
        </label>
        <input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
      </div>

      <fieldset className="buy-form-fieldset">
        <legend className="mono label">contato</legend>
        <input name="customerName" placeholder="nome completo" required />
        <input name="customerEmail" type="email" placeholder="e-mail" required />
        <input name="customerPhone" placeholder="telefone (com DDD)" required />
        <input name="customerCpf" placeholder="CPF (só números)" required />
      </fieldset>

      <fieldset className="buy-form-fieldset">
        <legend className="mono label">endereço de entrega</legend>
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
  );
}
