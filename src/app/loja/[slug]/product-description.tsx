"use client";

import { useState } from "react";

const COLLAPSED_LIMIT = 280;

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
