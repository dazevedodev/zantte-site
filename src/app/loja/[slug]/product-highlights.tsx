"use client";

import { useState } from "react";
import { ProductDescription } from "./product-description";

// muita descrição de produto vem com linhas "- destaque" (características
// principais). Em vez de deixar tudo misturado num parágrafo só — o que
// deixava a coluna de info curta e cheia de vazio ao lado da galeria —
// separa a intro (texto corrido) dos destaques (lista com ícone), que
// ocupam o espaço direito e ficam mais fáceis de escanear.
//
// Intro e destaques colapsam juntos, num "ver mais" só — quando a
// descrição é comprida (bastante destaque cadastrado), ela empurrava a
// linha de comprar bem mais pra baixo do que o "leve também" na galeria
// ao lado, um produto ficando bem diferente do outro. Colapsado, a coluna
// fica compacta e parecida entre produtos.
const TEXT_LIMIT = 160;
const BULLET_LIMIT = 3;

export function ProductHighlights({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines.filter((line) => line.startsWith("- ")).map((line) => line.replace(/^-\s*/, ""));
  const intro = lines.filter((line) => !line.startsWith("- ")).join(" ");

  if (bullets.length === 0) {
    return text ? <ProductDescription text={text} /> : null;
  }

  const introTooLong = intro.length > TEXT_LIMIT;
  const bulletsTooLong = bullets.length > BULLET_LIMIT;
  const isCollapsible = introTooLong || bulletsTooLong;

  const shownIntro = expanded || !introTooLong ? intro : `${intro.slice(0, TEXT_LIMIT).trimEnd()}…`;
  const shownBullets = expanded || !bulletsTooLong ? bullets : bullets.slice(0, BULLET_LIMIT);

  return (
    <div className="product-highlights">
      {shownIntro && (
        <div className="product-detail-description">
          <p>{shownIntro}</p>
        </div>
      )}
      <ul className="product-highlights-list">
        {shownBullets.map((bullet) => (
          <li key={bullet}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {isCollapsible && (
        <button type="button" className="product-detail-description-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "ver menos" : "ver descrição completa"}
        </button>
      )}
    </div>
  );
}
