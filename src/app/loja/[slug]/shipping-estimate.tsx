"use client";

import { useActionState } from "react";
import { formatBRL, formatCep } from "@/lib/store/format";
import { estimateProductShippingAction, type ShippingEstimateState } from "./shipping-actions";

// só some da tela se o produto não tem shippingType configurado — nesse
// caso o server action nem tem o que calcular, então melhor não mostrar
// nada do que mostrar um formulário que sempre dá erro.
export function ShippingEstimate({ productId }: { productId: string }) {
  const action = estimateProductShippingAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<ShippingEstimateState, FormData>(action, null);

  return (
    <div className="shipping-estimate">
      <form action={formAction} className="shipping-estimate-form">
        <label className="mono label" htmlFor="shipping-cep">
          calcular frete e prazo
        </label>
        <div className="shipping-estimate-row">
          <input
            id="shipping-cep"
            name="cep"
            placeholder="seu CEP"
            maxLength={9}
            onChange={(e) => {
              e.target.value = formatCep(e.target.value);
            }}
            required
          />
          <button type="submit" disabled={pending}>
            {pending ? "calculando..." : "calcular"}
          </button>
        </div>
      </form>

      {state?.status === "error" && <p className="shipping-estimate-error">{state.message}</p>}

      {state?.status === "ok" && state.estimate?.type === "own" && (
        <p className="shipping-estimate-result">
          {state.estimate.priceCents === 0 ? "frete grátis" : formatBRL(state.estimate.priceCents)} — chega em{" "}
          {state.estimate.minDays === state.estimate.maxDays
            ? `${state.estimate.minDays} dias úteis`
            : `${state.estimate.minDays} a ${state.estimate.maxDays} dias úteis`}
        </p>
      )}

      {state?.status === "ok" && state.estimate?.type === "drop" && (
        <p className="shipping-estimate-result">
          frete grátis — chega em {state.estimate.deliveryDays}
        </p>
      )}
    </div>
  );
}
