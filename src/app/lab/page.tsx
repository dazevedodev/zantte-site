"use client";

import { useState } from "react";
import { BrandObject, type BrandShape } from "@/components/brand-object";

const OPTIONS: { id: BrandShape; label: string; blurb: string }[] = [
  {
    id: "icosahedro",
    label: "Icosaedro",
    blurb: "O que já está no site — poliedro simples, anguloso, poucas faces.",
  },
  {
    id: "nucleo",
    label: "Núcleo geodésico",
    blurb: "Esfera facetada mais densa — sensação de núcleo técnico, compacto.",
  },
  {
    id: "monograma",
    label: "Monograma Z",
    blurb: "A própria letra Z, extrudada em 3D — a marca virando objeto direto.",
  },
  {
    id: "estrutura",
    label: "Estrutura wireframe",
    blurb: "Só as arestas de um dodecaedro, oco — clima de blueprint/engenharia.",
  },
  {
    id: "laco",
    label: "Laço torcido",
    blurb: "Fita contínua torcida — ideia de fluxo, do problema à solução.",
  },
];

export default function LabPage() {
  const [shape, setShape] = useState<BrandShape>("icosahedro");
  const current = OPTIONS.find((o) => o.id === shape)!;

  return (
    <div className="lab-page">
      <div className="lab-preview">
        <div className="hero-object">
          <BrandObject onCharged={() => {}} shape={shape} />
        </div>
      </div>

      <div className="lab-panel">
        <span className="mono label">escolher forma</span>
        <h1 className="display lab-heading">{current.label}</h1>
        <p className="lab-blurb">{current.blurb}</p>
        <div className="lab-options mono">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={o.id === shape ? "active" : ""}
              onClick={() => setShape(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
