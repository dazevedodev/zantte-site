import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site-config";

function client() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendContactFormEmail(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  await client().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: CONTACT_EMAIL,
    replyTo: input.email || undefined,
    subject: `Novo contato pelo site — ${input.name}`,
    text: [
      `Nome: ${input.name}`,
      input.email ? `E-mail: ${input.email}` : null,
      input.phone ? `Telefone: ${input.phone}` : null,
      ``,
      input.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
