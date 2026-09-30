import Link from "next/link";
import { Footer } from "@/components/footer";
import { WHATSAPP_URL } from "@/lib/site-config";
import { listActiveProducts } from "@/lib/store/products";
import { formatBRL } from "@/lib/store/format";
import { listActivePortfolioProjects } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function SobrePage() {
  // prova visual real em vez de texto solto — nunca inventada, só o que já
  // está ativo no banco (produtos da loja, projetos do portfólio). Prioriza
  // quem tem imagem cadastrada.
  const [allProducts, allProjects] = await Promise.all([listActiveProducts(), listActivePortfolioProjects()]);
  const products = allProducts.filter((p) => p.imageUrls[0]).slice(0, 3);
  const projects = allProjects.filter((p) => p.coverUrl).slice(0, 3);

  return (
    <div className="simple-page-pastel">
      <div className="simple-page-logo-wrap">
        <Link href="/" className="site-logo display" aria-label="zantte">
          zantte
        </Link>
      </div>

      <section className="simple-page">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
        <img src="/icons/mascot.png" alt="" className="about-mascot" />

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

        {projects.length > 0 && (
          <div className="about-showcase">
            {projects.map((p) => (
              <a
                key={p.id}
                href={p.url ?? "/portfolio"}
                target={p.url ? "_blank" : undefined}
                rel={p.url ? "noreferrer" : undefined}
                className="about-showcase-item"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- capa vem do Blob, sem otimização necessária aqui. */}
                <img src={p.coverUrl!} alt={p.name} />
                <span className="about-showcase-name">{p.name}</span>
                {p.tagline && <span className="about-showcase-price">{p.tagline}</span>}
              </a>
            ))}
          </div>
        )}

        <h2 className="simple-page-subheading">zantte + zan co.</h2>
        <p className="simple-page-text">
          A Zantte é o estúdio: quem projeta e constrói o sistema. A ZAN CO. é a loja que a própria Zantte roda —
          não é um projeto de cliente de mentira, é negócio da casa mesmo, com produto de verdade, cliente de
          verdade, frete e pagamento de verdade. Cada peça do checkout (carrinho, cálculo de frete, Pix,
          confirmação por e-mail) passa primeiro aqui. Se alguma coisa quebra, quebra na nossa própria loja antes
          de chegar em qualquer sistema entregue pra fora.
        </p>

        {products.length > 0 && (
          <div className="about-showcase">
            {products.map((p) => (
              <Link key={p.id} href={`/loja/${p.slug}`} className="about-showcase-item">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
                <img src={p.imageUrls[0]} alt={p.name} />
                <span className="about-showcase-name">{p.name}</span>
                <span className="about-showcase-price">{formatBRL(p.priceCents)}</span>
              </Link>
            ))}
          </div>
        )}

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
          <Link href="/loja">ver a zan co.</Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            falar com a gente
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
