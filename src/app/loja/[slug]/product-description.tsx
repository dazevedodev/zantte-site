"use client";

import { useState } from "react";

// mais compacto do que antes (era 280) — em produtos sem "- destaque"
// cadastrado (só parágrafo corrido), esse é o único freio de altura da
// coluna de info; sem ele bem apertado, sobra um vão vazio enorme do lado
// da galeria em produtos com pouco mais conteúdo (frete, selos etc.).
const COLLAPSED_LIMIT = 150;

export function ProductDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSED_LIMIT;

  return (
    <div className="product-detail-description">
      <p>{expanded || !isLong ? text : `${text.slice(0, COLLAPSED_LIMIT).trimEnd()}…`}</p>
      {isLong && (
        <button type="button" className="product-detail-description-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "ver menos" : "ver descrição completa"}
        </button>
      )}
    </div>
  );
}
