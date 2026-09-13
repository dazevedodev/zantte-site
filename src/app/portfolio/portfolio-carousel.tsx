"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/projects";

// Sem foto real ainda — em vez do preview ao vivo por iframe, gera uma capa
// só com a inicial do projeto, no mesmo tratamento "de vidro" da logo.
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// carrossel HORIZONTAL, infinito nos dois sentidos — sem começo nem fim.
// Truque: a lista é renderizada 3x seguidas (cópia anterior / cópia do
// meio / cópia seguinte); a gente começa rolado pro início da cópia do
// meio, e sempre que o scroll entra fundo demais numa cópia vizinha, salta
// de volta pra posição equivalente na cópia do meio SEM animação — como o
// conteúdo é idêntico entre cópias, o salto é imperceptível e dá a
// sensação de rolar pra sempre em qualquer direção.
export function PortfolioCarousel({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const n = projects.length;
  const track = n > 0 ? [...projects, ...projects, ...projects] : [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || n === 0) return;
    let raf = 0;
    let scheduled = false;

    function copyWidth() {
      const first = itemRefs.current[0];
      const firstOfNextCopy = itemRefs.current[n];
      if (!first || !firstOfNextCopy) return 0;
      return firstOfNextCopy.offsetLeft - first.offsetLeft;
    }

    const update = () => {
      scheduled = false;
      const container = containerRef.current;
      if (!container) return;

      // realinha antes de medir, pra nunca deixar a pessoa ver a borda
      // real do início/fim da lista triplicada.
      const cw = copyWidth();
      if (cw > 0) {
        if (container.scrollLeft < cw * 0.5) {
          container.scrollLeft += cw;
        } else if (container.scrollLeft > cw * 1.5) {
          container.scrollLeft -= cw;
        }
      }

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

    // começa no início da cópia do meio.
    const cw = copyWidth();
    if (cw > 0) container.scrollLeft = cw;
    update();

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  return (
    <div ref={containerRef} className="portfolio-hcarousel">
      <div className="portfolio-hcarousel-track">
        {track.map((p, i) => (
          <a
            key={`${p.name}-${i}`}
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
        {track.length === 0 && <div className="portfolio-carousel-empty mono">em breve</div>}
      </div>
    </div>
  );
}
