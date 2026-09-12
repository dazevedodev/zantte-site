// ícones das formas de pagamento aceitas — tudo processado pelo Mercado
// Pago, mas mostrar Pix/cartão/boleto separado ajuda a pessoa a ver de
// cara que o método que ela quer usar existe, sem precisar entrar no
// checkout pra descobrir.
const METHODS = [
  {
    name: "Pix",
    icon: <path d="M13 3 5 13h5l-2 8 8-10h-5z" strokeLinejoin="round" strokeLinecap="round" />,
  },
  {
    name: "Cartão de crédito",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="1.5" />
        <path d="M3 10h18" />
      </>
    ),
  },
  {
    name: "Boleto",
    icon: (
      <>
        <path d="M4 4v16" />
        <path d="M7 4v16" strokeWidth="2.4" />
        <path d="M10 4v16" />
        <path d="M12.5 4v16" strokeWidth="2.4" />
        <path d="M15 4v16" />
        <path d="M18 4v16" strokeWidth="2.4" />
        <path d="M20.5 4v16" />
      </>
    ),
  },
];

export function PaymentMethods() {
  return (
    <ul className="payment-methods">
      {METHODS.map((method) => (
        <li key={method.name}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {method.icon}
          </svg>
          <span>{method.name}</span>
        </li>
      ))}
    </ul>
  );
}
