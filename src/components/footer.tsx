import Link from "next/link";
import { WHATSAPP_URL, INSTAGRAM_URL, CONTACT_EMAIL } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="footer">
      <span className="mono footer-brand">zantte</span>
      <div className="footer-links mono">
        <Link href="/loja">loja</Link>
        <a href={WHATSAPP_URL}>WhatsApp ↗</a>
        <a href={INSTAGRAM_URL}>Instagram ↗</a>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
      </div>
    </footer>
  );
}
