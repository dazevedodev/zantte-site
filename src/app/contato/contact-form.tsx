"use client";

import { useActionState } from "react";
import { submitContactFormAction, type ContactFormState } from "./contact-form-actions";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContactFormAction,
    null,
  );

  if (state?.success) {
    return <p className="contact-form-success">mensagem enviada — respondemos em breve.</p>;
  }

  return (
    <form action={formAction} className="contact-form">
      <input name="name" placeholder="nome" required />
      <div className="contact-form-row">
        <input name="phone" placeholder="telefone" />
        <input name="email" type="email" placeholder="e-mail" />
      </div>
      <textarea name="message" placeholder="sua mensagem" rows={4} required />

      {state?.error && <p className="contact-form-error">{state.error}</p>}

      <button type="submit" className="contact-form-submit" disabled={pending}>
        {pending ? "enviando..." : "enviar"}
      </button>
    </form>
  );
}
