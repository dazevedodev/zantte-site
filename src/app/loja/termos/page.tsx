import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { StoreFooter } from "../store-footer";

export const metadata = { title: "Termos e privacidade — ZAN CO." };

export default function TermosPage() {
  return (
    <>
      <nav className="product-breadcrumb mono" aria-label="breadcrumb">
        <Link href="/loja">loja</Link>
        <span>/</span>
        <span className="product-breadcrumb-current">Termos e privacidade</span>
      </nav>

      <section className="simple-page legal-page">
        <span className="mono label">termos e privacidade</span>
        <h1 className="display simple-page-heading">Como a ZAN CO. funciona e trata seus dados.</h1>

        <h2>Sobre a loja</h2>
        <p>
          A ZAN CO. é a loja online operada pela Zantte. Ao comprar aqui, você concorda com estes termos e com
          o Código de Defesa do Consumidor (Lei 8.078/1990), que vale pra toda compra feita à distância no Brasil.
        </p>

        <h2>Dados que coletamos</h2>
        <p>
          Pra processar seu pedido, coletamos nome, e-mail, telefone, CPF e endereço de entrega. Esses dados são
          usados exclusivamente para confirmar a compra, processar o pagamento (via Mercado Pago) e realizar a
          entrega — nunca são vendidos ou repassados a terceiros fora desse propósito.
        </p>

        <h2>Pagamento</h2>
        <p>
          Todo pagamento é processado diretamente pelo Mercado Pago. A ZAN CO. não tem acesso e não armazena
          dados de cartão de crédito.
        </p>

        <h2>Cookies e anúncios</h2>
        <p>
          Usamos o Meta Pixel (Facebook/Instagram) para medir o desempenho dos nossos anúncios e entender quais
          páginas você visitou antes de comprar. Esses dados são anônimos pra nós e seguem a política de
          privacidade da própria Meta.
        </p>

        <h2>Seus direitos (LGPD)</h2>
        <p>
          Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir a qualquer momento pra
          acessar, corrigir ou excluir seus dados pessoais que temos. É só mandar um e-mail pra{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>Troca, devolução e arrependimento</h2>
        <p>
          Você tem até 7 dias corridos após o recebimento do produto pra solicitar troca, devolução ou
          arrependimento da compra, sem precisar justificar o motivo — direito garantido pelo Art. 49 do CDC pra
          compras feitas fora de loja física.
        </p>
      </section>

      <StoreFooter />
    </>
  );
}
