import Link from "next/link";
import { WHATSAPP_URL, INSTAGRAM_URL, CONTACT_EMAIL } from "@/lib/site-config";

export function Footer({
  extraLinks = [],
}: {
  // links extras (ex: dúvidas/termos da loja) — entram na mesma fileira
  // dos outros, não soltos numa linha separada por cima.
  extraLinks?: { href: string; label: string }[];
}) {
  return (
    <footer className="footer">
      <span className="footer-brand">zantte</span>
      <div className="footer-links">
        <Link href="/loja">Loja</Link>
        {extraLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <a href={WHATSAPP_URL}>WhatsApp ↗</a>
        <a href={INSTAGRAM_URL}>Instagram ↗</a>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
      </div>
    </footer>
  );
}
