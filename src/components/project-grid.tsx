"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, PROJECTS, type ProjectCategory } from "@/lib/projects";

type Filter = "todos" | ProjectCategory;

const FILTER_LABELS: Record<Filter, string> = {
  todos: "todos os projetos",
  ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])),
} as Record<Filter, string>;

// Sem foto real ainda — em vez do preview ao vivo por iframe, gera uma capa
// só com a inicial do projeto, no mesmo tratamento "de vidro" da logo.
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export function ProjectGrid() {
  const [filter, setFilter] = useState<Filter>("todos");
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () => (filter === "todos" ? PROJECTS : PROJECTS.filter((p) => p.category === filter)),
    [filter],
  );

  const select = (f: Filter) => {
    setFilter(f);
    setOpen(false);
  };

  return (
    <div className="project-grid-page">
      <div className="project-grid-head">
        <span className="mono label">filtro</span>
        <button
          type="button"
          className={`display project-grid-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {FILTER_LABELS[filter]}
          <span className="project-grid-toggle-arrow">⌄</span>
        </button>

        {open && (
          <div className="project-grid-dropdown">
            <button type="button" className="display" onClick={() => select("todos")}>
              todos os projetos
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="display" onClick={() => select(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="project-grid">
        {visible.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target={p.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`project-grid-card ${!p.url ? "is-static" : ""}`}
          >
            <div className="project-grid-card-bar mono">
              <span className="project-grid-card-url">{p.name}</span>
            </div>
            {p.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- capa vem de arquivo estático simples, sem otimização necessária aqui.
              <img src={p.cover} alt={p.name} className="project-grid-card-cover" />
            ) : (
              <div className="project-grid-card-placeholder-cover display" aria-hidden="true">
                <span className="corner corner-tl" />
                <span className="corner corner-tr" />
                <span className="corner corner-bl" />
                <span className="corner corner-br" />
                <span className="sheen" />
                <span className="initial">{initial(p.name)}</span>
              </div>
            )}
          </a>
        ))}
        {visible.length === 0 && (
          <div className="project-grid-empty mono">
            <span className="plus">+</span>
            <span>em breve</span>
          </div>
        )}
      </div>
    </div>
  );
}
