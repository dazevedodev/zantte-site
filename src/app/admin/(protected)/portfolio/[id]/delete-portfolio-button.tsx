"use client";

import { useActionState } from "react";
import { deletePortfolioProjectAction, type DeletePortfolioProjectState } from "../actions";

export function DeletePortfolioButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const action = deletePortfolioProjectAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState<DeletePortfolioProjectState, FormData>(action, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Excluir "${projectName}" de vez? Isso não pode ser desfeito.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="admin-delete-btn" disabled={pending}>
        {pending ? "excluindo..." : "excluir projeto"}
      </button>
      {state?.error && <p className="buy-form-error">{state.error}</p>}
    </form>
  );
}
