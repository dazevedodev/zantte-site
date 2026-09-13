"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/projects";

// Sem foto real ainda — em vez do preview ao vivo por iframe, gera uma capa
// só com a inicial do projeto, no mesmo tratamento "de vidro" da logo.
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// carrossel HORIZONTAL com perspectiva — igual a referência BOSE/Motion que
// ela mandou no início: rola de lado, o card perto do centro fica reto, os
// que se afastam (esquerda/direita) inclinam em 3D e encolhem, tipo um
// cilindro girando na horizontal. Recalcula no evento de scroll (throttled
// por rAF), não num loop perpétuo — mais leve e não deixa o navegador
// "ocupado" pra sempre (isso travava ferramentas de automação/print da
// página).
export function PortfolioCarousel({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;
    let scheduled = false;

    const update = () => {
      scheduled = false;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      for (const el of itemRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const elCenter = r.left + r.width / 2;
        const offset = Math.max(-1.4, Math.min(1.4, (elCenter - centerX) / rect.width));
        const rotate = offset * 34;
        const translateZ = -Math.abs(offset) * 260;
        const scale = 1 - Math.abs(offset) * 0.22;
        const opacity = Math.max(0.12, 1 - Math.abs(offset) * 0.55);
        el.style.transform = `translateZ(${translateZ}px) rotateY(${-rotate}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="portfolio-hcarousel">
      <div className="portfolio-hcarousel-track">
        {projects.map((p, i) => (
          <a
            key={p.name}
            href={p.url}
            target={p.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="portfolio-hcarousel-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            {p.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- capa vem de arquivo estático simples, sem otimização necessária aqui.
              <img src={p.cover} alt={p.name} className="portfolio-hcarousel-cover" />
            ) : (
              <div className="portfolio-hcarousel-placeholder display" aria-hidden="true">
                <span className="initial">{initial(p.name)}</span>
              </div>
            )}
            <span className="portfolio-hcarousel-name mono">{p.name}</span>
          </a>
        ))}
        {projects.length === 0 && <div className="portfolio-carousel-empty mono">em breve</div>}
      </div>
    </div>
  );
}
