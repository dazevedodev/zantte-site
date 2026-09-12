import { ProductDescription } from "./product-description";

// muita descrição de produto vem com linhas "- destaque" (características
// principais). Em vez de deixar tudo misturado num parágrafo só — o que
// deixava a coluna de info curta e cheia de vazio ao lado da galeria —
// separa a intro (texto corrido) dos destaques (lista com ícone), que
// ocupam o espaço direito e ficam mais fáceis de escanear.
export function ProductHighlights({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines.filter((line) => line.startsWith("- "));
  const intro = lines.filter((line) => !line.startsWith("- ")).join(" ");

  if (bullets.length === 0) {
    return text ? <ProductDescription text={text} /> : null;
  }

  return (
    <div className="product-highlights">
      {intro && <ProductDescription text={intro} />}
      <ul className="product-highlights-list">
        {bullets.map((bullet) => (
          <li key={bullet}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{bullet.replace(/^-\s*/, "")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
