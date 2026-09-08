import Link from "next/link";
import { Footer } from "@/components/footer";

export default function SobrePage() {
  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/">← voltar</Link>
      </header>

      <section className="simple-page">
        <span className="mono label">sobre</span>
        <h1 className="display simple-page-heading">
          Antes de qualquer sistema, entendemos o problema de operação.
        </h1>
        <p className="simple-page-text">
          Não perguntamos &quot;que site você quer&quot; — perguntamos onde o processo trava: fila, comanda,
          estoque, atendimento. A solução é ferramenta; o produto de verdade é o resultado que o negócio ganha.
        </p>
      </section>

      <Footer />
    </>
  );
}
