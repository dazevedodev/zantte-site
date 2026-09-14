import Link from "next/link";
import { Footer } from "@/components/footer";
import { WHATSAPP_URL } from "@/lib/site-config";

export default function SobrePage() {
  return (
    <div className="simple-page-pastel">
      <Link href="/" className="site-logo display simple-page-logo" aria-label="zantte">
        zantte
      </Link>

      <section className="simple-page">
        <span className="simple-page-eyebrow">sobre</span>
        <h1 className="simple-page-heading">Antes de qualquer sistema, entendemos o problema de operação.</h1>
        <p className="simple-page-text">
          Não perguntamos &quot;que site você quer&quot; — perguntamos onde o processo trava: fila, comanda,
          estoque, atendimento. A solução é ferramenta; o produto de verdade é o resultado que o negócio ganha.
        </p>

        <h2 className="simple-page-subheading">o que a gente faz</h2>
        <p className="simple-page-text">
          Construímos sistemas sob medida pra negócios que cresceram além da planilha e do papel — de gestão de
          aluguel a acompanhamento de treino, cada projeto nasce de um processo real que precisava parar de
          depender de memória ou de anotação solta. Sem molde pronto: entendemos o fluxo de quem usa todo dia
          antes de desenhar uma tela.
        </p>
        <p className="simple-page-text">
          A ZAN CO., nossa própria loja, é prova disso funcionando na prática: da vitrine ao checkout, é o mesmo
          time que constrói sistema pra cliente rodando o próprio negócio, sentindo o que quebra antes de vender
          a solução pra outra empresa.
        </p>

        <h2 className="simple-page-subheading">como a gente trabalha</h2>
        <p className="simple-page-text">
          Conversa direta, sem elo perdido entre quem entende o problema e quem escreve o código — geralmente
          pelo WhatsApp, sem formulário de ticket nem central de atendimento. Entrega em etapas visíveis, não um
          projeto fechado que só aparece pronto (ou atrasado) meses depois.
        </p>

        <div className="simple-page-links">
          <Link href="/portfolio" className="btn-solid">
            ver projetos
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            falar com a gente
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
