import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="store-state-page">
      <span className="store-state-mark display">×</span>
      <h1 className="store-state-heading">esse produto não existe (mais)</h1>
      <p className="store-state-text">
        pode ter saído de catálogo ou o link tá errado — mas tem bastante coisa boa esperando na loja.
      </p>
      <Link href="/loja" className="store-hero-cta">
        ver produtos
      </Link>
    </div>
  );
}
