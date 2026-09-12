import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/site-config";
import { StoreFooter } from "../store-footer";

export const metadata = { title: "Dúvidas frequentes — ZAN CO." };

const FAQ = [
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Pix, cartão de crédito e boleto — tudo processado com segurança pelo Mercado Pago.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "Despachamos em até 2 dias úteis após a confirmação do pagamento. O prazo de entrega varia conforme sua região e é calculado no checkout, antes de você fechar a compra.",
  },
  {
    q: "Posso trocar ou devolver um produto?",
    a: "Sim. Você tem até 7 dias corridos após o recebimento pra pedir troca ou devolução, direito garantido pelo Código de Defesa do Consumidor. É só chamar no WhatsApp.",
  },
  {
    q: "Como acompanho meu pedido?",
    a: "Assim que o pedido é enviado, mandamos o código de rastreio pro e-mail informado na compra.",
  },
  {
    q: "É seguro comprar aqui?",
    a: "É. Todo pagamento é processado pelo Mercado Pago — a gente nunca vê nem guarda o número do seu cartão.",
  },
  {
    q: "Como falo com vocês?",
    a: "WhatsApp é o canal mais rápido pra qualquer dúvida, antes ou depois da compra.",
  },
];

export default function DuvidasPage() {
  return (
    <>
      <nav className="product-breadcrumb mono" aria-label="breadcrumb">
        <Link href="/loja">loja</Link>
        <span>/</span>
        <span className="product-breadcrumb-current">Dúvidas frequentes</span>
      </nav>

      <section className="simple-page">
        <span className="mono label">dúvidas frequentes</span>
        <h1 className="display simple-page-heading">Antes de perguntar, dá uma olhada aqui.</h1>

        <dl className="faq-list">
          {FAQ.map((item) => (
            <div key={item.q} className="faq-item">
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="simple-page-links mono">
          <a href={WHATSAPP_URL} className="btn-solid">
            não achou sua dúvida? chama no WhatsApp ↗
          </a>
        </div>
      </section>

      <StoreFooter />
    </>
  );
}
