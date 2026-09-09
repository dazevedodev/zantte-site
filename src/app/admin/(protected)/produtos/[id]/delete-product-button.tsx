"use client";

import { useActionState } from "react";
import { deleteProductAction, type DeleteProductState } from "../actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const action = deleteProductAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<DeleteProductState, FormData>(action, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Excluir "${productName}" de vez? Isso não pode ser desfeito.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="admin-delete-btn" disabled={pending}>
        {pending ? "excluindo..." : "excluir produto"}
      </button>
      {state?.error && <p className="buy-form-error">{state.error}</p>}
    </form>
  );
}
