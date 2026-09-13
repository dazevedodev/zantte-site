// "por que comprar com a gente" — reforça confiança na home da loja, antes
// de a pessoa começar a navegar pelo catálogo. Só argumentos que a gente
// consegue sustentar de verdade (nada de prova social inventada).
const REASONS = [
  {
    title: "Curadoria cuidadosa",
    text: "Cada produto é escolhido a dedo, sem enrolação de catálogo genérico.",
    icon: (
      <path
        d="M12 3l2.2 4.9 5.3.6-4 3.6 1.1 5.3-4.6-2.7-4.6 2.7 1.1-5.3-4-3.6 5.3-.6z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Atendimento direto",
    text: "Fala com a gente pelo WhatsApp, direto com quem toca a loja — sem robô.",
    icon: (
      <path
        d="M4 5h16v11H8l-4 4z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Compra 100% segura",
    text: "Pagamento processado pelo Mercado Pago, com toda a proteção deles.",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Envio pra todo o Brasil",
    text: "Despacho rápido, entrega em qualquer cidade do país.",
    icon: (
      <>
        <path d="M3 7h11v10H3z" strokeLinejoin="round" />
        <path d="M14 10h4l3 3v4h-7z" strokeLinejoin="round" />
        <circle cx="7.5" cy="19" r="1.6" />
        <circle cx="17.5" cy="19" r="1.6" />
      </>
    ),
  },
  {
    title: "Troca garantida",
    text: "Arrependeu? Tem até 7 dias pra trocar ou devolver, garantido por lei.",
    icon: (
      <path
        d="M4 12a8 8 0 0 1 13.6-5.7M20 12a8 8 0 0 1-13.6 5.7M17 3v4h-4M7 21v-4h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Acompanhe seu pedido",
    text: "Rastreamento em tempo real, direto no link que a gente manda por e-mail.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

// marquee horizontal contínuo (CSS puro, sem JS/rAF) — duplica a lista
// uma vez e anima translateX até -50%, um loop sem emenda visível.
const TRACK = [...REASONS, ...REASONS];

export function WhyBuy() {
  return (
    <section className="why-buy">
      <span className="label">por que comprar com a gente</span>
      <div className="why-buy-marquee">
        <div className="why-buy-grid">
          {TRACK.map((reason, i) => (
            <div key={`${reason.title}-${i}`} className="why-buy-item" aria-hidden={i >= REASONS.length}>
              <div className="why-buy-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  {reason.icon}
                </svg>
              </div>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
