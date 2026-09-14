// selos de confiança perto da compra — pagamento, entrega e política de
// troca. Reaproveitado na página do produto e no carrinho: é exatamente na
// hora de decidir comprar que a loja precisa parecer "de verdade".
export function TrustBadges() {
  return (
    <ul className="trust-badges">
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3 7h11v10H3z" strokeLinejoin="round" />
          <path d="M14 10h4l3 3v4h-7z" strokeLinejoin="round" />
          <circle cx="7.5" cy="19" r="1.6" />
          <circle cx="17.5" cy="19" r="1.6" />
        </svg>
        <span>
          Envio para todo o Brasil
          <small>despacho em até 2 dias úteis</small>
        </span>
      </li>
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M4 12a8 8 0 1 1 2.6 5.9" strokeLinecap="round" />
          <path d="M4 17v-5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          Troca ou devolução grátis
          <small>até 7 dias, direito garantido por lei</small>
        </span>
      </li>
    </ul>
  );
}
