import Link from "next/link";
import { Footer } from "@/components/footer";
import { WHATSAPP_URL, INSTAGRAM_URL, CONTACT_EMAIL } from "@/lib/site-config";

export default function ContatoPage() {
  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/">← voltar</Link>
      </header>

      <section className="simple-page">
        <span className="mono label">contato</span>
        <h1 className="display simple-page-heading">Conte o problema. A gente vê se faz sentido.</h1>
        <p className="simple-page-text">Resposta rápida, sem formulário burocrático — só chamar no WhatsApp.</p>
        <div className="simple-page-links mono">
          <a href={WHATSAPP_URL} className="btn-solid">
            Falar no WhatsApp ↗
          </a>
          <a href={INSTAGRAM_URL}>Instagram ↗</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
        </div>
      </section>

      <Footer />
    </>
  );
}
