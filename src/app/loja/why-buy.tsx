// "por que comprar com a gente" — faixa contínua (ticker) com os motivos.
// Só argumentos que a gente consegue sustentar de verdade (nada de prova
// social inventada).
const REASONS = [
  "curadoria cuidadosa",
  "atendimento direto",
  "compra 100% segura",
  "envio pra todo o brasil",
  "troca garantida",
  "acompanhe seu pedido",
];

export function WhyBuy() {
  return (
    <section className="why-buy">
      <span className="label">por que comprar com a gente</span>
      <div className="why-buy-band" aria-label="por que comprar com a gente">
        <div className="why-buy-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="why-buy-set" aria-hidden={copy === 1}>
              {REASONS.map((reason) => (
                <span key={reason} className="why-buy-word">
                  {reason}
                  <span className="why-buy-dot" aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
