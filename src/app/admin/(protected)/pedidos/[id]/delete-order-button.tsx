"use client";

import { useActionState } from "react";
import { deleteOrderAction, type DeleteOrderState } from "./actions";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const action = deleteOrderAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState<DeleteOrderState, FormData>(action, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Excluir esse pedido de vez? Isso não pode ser desfeito.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="admin-delete-btn" disabled={pending}>
        {pending ? "excluindo..." : "excluir pedido"}
      </button>
      {state?.error && <p className="buy-form-error">{state.error}</p>}
    </form>
  );
}
