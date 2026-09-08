"use client";

import { useActionState } from "react";
import { markShippedAction, type OrderActionState } from "./actions";

export function ShipForm({ orderId }: { orderId: string }) {
  const action = markShippedAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState<OrderActionState, FormData>(action, null);

  return (
    <form action={formAction} className="admin-ship-form">
      <input name="trackingCarrier" placeholder="transportadora" required />
      <input name="trackingCode" placeholder="código de rastreio" required />
      {state?.error && <p className="buy-form-error">{state.error}</p>}
      <button type="submit" className="btn-solid" disabled={pending}>
        {pending ? "salvando..." : "marcar como enviado"}
      </button>
    </form>
  );
}
