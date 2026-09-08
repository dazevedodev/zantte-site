"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <section className="admin-login">
      <span className="mono label">zantte / admin</span>
      <h1 className="display admin-login-heading">entrar</h1>
      <form action={formAction} className="admin-login-form">
        <input name="password" type="password" placeholder="senha" required autoFocus />
        {state?.error && <p className="buy-form-error">{state.error}</p>}
        <button type="submit" className="btn-solid" disabled={pending}>
          {pending ? "entrando..." : "entrar"}
        </button>
      </form>
    </section>
  );
}
