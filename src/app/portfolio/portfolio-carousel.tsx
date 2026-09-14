"use client";

import { useEffect, useRef } from "react";
import type { PortfolioProject } from "@/lib/portfolio";

// Sem foto real ainda — em vez do preview ao vivo por iframe, gera uma capa
// só com a inicial do projeto, no mesmo tratamento "de vidro" da logo.
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

// alguém pode esquecer o "https://" ao cadastrar o link no admin — sem
// protocolo, o navegador interpreta como caminho relativo do próprio site
// (zantte.com.br/exemplo.com.br) em vez de abrir o site externo.
function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// carrossel HORIZONTAL, infinito nos dois sentidos — sem começo nem fim.
// Truque simples: a lista é renderizada bastante repetida (COPIES cópias) e
// começa rolada pro início de uma cópia do meio.
//
// Versão anterior tentava "corrigir" o scroll em tempo real toda vez que a
// pessoa se afastava demais do centro, pra nunca deixar ver a borda real da
// lista — mas corrigir a posição no meio de uma passagem (clique na seta
// ou no trackpad) cancelava a animação em andamento e dava uma travada, ou
// um pulo de vários cards de uma vez, dependendo de quando a correção
// batia. Só repetir a lista MUITAS vezes é mais simples e sem esse risco:
// com esse tanto de cópia, dá pra clicar dezenas de vezes seguidas pra
// qualquer lado sem nunca chegar na borda de verdade — nenhuma correção
// de posição precisa acontecer.
const COPIES = 16;
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
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(updateTransforms);
    };

    // centraliza o item do meio já na posição final, sem nenhuma animação
    // de entrada — scrollIntoView com behavior:"instant" usa a medida real
    // do navegador (em vez de recalcular a largura da cópia manualmente),
    // então cai exatamente no ponto de centralização sem sobra nenhuma que
    // o scroll-snap precisasse "corrigir" com um pulinho depois. E
    // desliga a transição de transform/opacity só nesse instante inicial,
    // pra ela não "abrir" do achatado pro inclinado quando a página abre —
    // já nasce no estado final.
    const trackEl = container.querySelector<HTMLElement>(".portfolio-hcarousel-track");
    trackEl?.classList.add("no-transition");
    itemRefs.current[MIDDLE_COPY * n]?.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
    updateTransforms();
    requestAnimationFrame(() => trackEl?.classList.remove("no-transition"));

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
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
            href={p.url ? normalizeUrl(p.url) : undefined}
            className="portfolio-hcarousel-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <span className="portfolio-hcarousel-cover-wrap">
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- capa vem do Blob, sem otimização necessária aqui.
                <img src={p.coverUrl} alt={p.name} className="portfolio-hcarousel-cover" />
              ) : (
                <div className="portfolio-hcarousel-placeholder display" aria-hidden="true">
                  <span className="initial">{initial(p.name)}</span>
                </div>
              )}
              {p.url && (
                <span className="portfolio-hcarousel-cta">
                  ver projeto
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </span>
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
