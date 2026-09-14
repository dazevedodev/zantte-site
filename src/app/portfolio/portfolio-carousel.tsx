"use client";

import { useEffect, useRef } from "react";
import type { PortfolioProject } from "@/lib/portfolio";

// Sem foto real ainda — em vez do preview ao vivo por iframe, gera uma capa
// só com a inicial do projeto, no mesmo tratamento "de vidro" da logo.
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// carrossel HORIZONTAL, infinito nos dois sentidos — sem começo nem fim.
// Truque: a lista é renderizada repetida (COPIES cópias seguidas); a gente
// começa rolado pro início da cópia do meio, e quando o scroll se afasta
// demais dela, salta de volta pra posição equivalente SEM animação — como
// o conteúdo é idêntico entre cópias, o salto é imperceptível.
//
// O pulo tem que acontecer só depois que o scroll ASSENTAR (debounce),
// nunca no meio de uma animação: corrigir o scrollLeft enquanto o
// scrollBy({behavior:"smooth"}) do botão ainda está em andamento cancela a
// animação do navegador na hora e trava a passagem — é exatamente essa
// travada que ela via só indo pra um lado (o lado em que o clique já
// aterrissava perto do limite da cópia). Com só 2 projetos, um clique
// sozinho já é metade da largura de uma cópia, então o limite batia quase
// toda hora; por isso a lista agora repete mais vezes (mais fôlego) e o
// realinhamento espera o scroll ficar quieto antes de agir.
const COPIES = 5;
const MIDDLE_COPY = Math.floor(COPIES / 2);

export function PortfolioCarousel({ projects }: { projects: PortfolioProject[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const n = projects.length;
  const track = n > 0 ? Array.from({ length: COPIES }, () => projects).flat() : [];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || n === 0) return;
    let raf = 0;
    let scheduled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    function copyWidth() {
      const first = itemRefs.current[0];
      const firstOfNextCopy = itemRefs.current[n];
      if (!first || !firstOfNextCopy) return 0;
      return firstOfNextCopy.offsetLeft - first.offsetLeft;
    }

    // só reposiciona (sem animação) quando não há mais nada rolando —
    // nunca durante uma passagem em andamento.
    function realign() {
      const container = containerRef.current;
      if (!container) return;
      const cw = copyWidth();
      if (cw <= 0) return;
      const middle = cw * MIDDLE_COPY;
      if (container.scrollLeft < middle - cw * 0.5) {
        container.scrollLeft += cw;
      } else if (container.scrollLeft > middle + cw * 0.5) {
        container.scrollLeft -= cw;
      }
    }

    const updateTransforms = () => {
      scheduled = false;
      const container = containerRef.current;
      if (!container) return;

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
      if (!scheduled) {
        scheduled = true;
        raf = requestAnimationFrame(updateTransforms);
      }
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(realign, 120);
    };

    // começa no início da cópia do meio.
    const cw = copyWidth();
    if (cw > 0) container.scrollLeft = cw * MIDDLE_COPY;
    updateTransforms();

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      if (settleTimer) clearTimeout(settleTimer);
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  // navegação por botão — passa 1 item de cada vez, suave e controlado (em
  // vez de depender só do scroll direto, que em trackpad/mouse rápido
  // passava vários itens de uma vez e dava a sensação de "borrão").
  function goTo(direction: -1 | 1) {
    const container = containerRef.current;
    const a = itemRefs.current[0];
    const b = itemRefs.current[1];
    if (!container || !a || !b) return;
    const step = b.offsetLeft - a.offsetLeft;
    container.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <>
      {/* fora do container com "perspective" de propósito — perspective
          (assim como transform) cria um novo containing block pra
          position:fixed, então um botão fixed lá dentro fica preso à
          faixa que rola pro lado em vez de grudar na viewport. */}
      <button
        type="button"
        className="portfolio-hcarousel-arrow prev"
        aria-label="projeto anterior"
        onClick={() => goTo(-1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className="portfolio-hcarousel-arrow next"
        aria-label="próximo projeto"
        onClick={() => goTo(1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div ref={containerRef} className="portfolio-hcarousel">
      <div className="portfolio-hcarousel-track">
        {track.map((p, i) => (
          <a
            key={`${p.id}-${i}`}
            href={p.url ?? undefined}
            target={p.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="portfolio-hcarousel-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            {p.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- capa vem do Blob, sem otimização necessária aqui.
              <img src={p.coverUrl} alt={p.name} className="portfolio-hcarousel-cover" />
            ) : (
              <div className="portfolio-hcarousel-placeholder display" aria-hidden="true">
                <span className="initial">{initial(p.name)}</span>
              </div>
            )}
            <span className="portfolio-hcarousel-caption">
              <span className="portfolio-hcarousel-name">{p.name}</span>
              {p.tagline && <span className="portfolio-hcarousel-tagline mono">{p.tagline}</span>}
            </span>
          </a>
        ))}
        {track.length === 0 && <div className="portfolio-carousel-empty mono">em breve</div>}
      </div>
      </div>
    </>
  );
}
