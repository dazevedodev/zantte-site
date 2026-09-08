"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/store/types";
import { formatBRL } from "@/lib/store/format";

export function StoreGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const [filter, setFilter] = useState<string | "todos">("todos");
  const [open, setOpen] = useState(false);

  const visible = useMemo(
    () => (filter === "todos" ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  const select = (f: string | "todos") => {
    setFilter(f);
    setOpen(false);
  };

  return (
    <>
      {categories.length > 1 && (
        <div className="store-filter-row mono">
          <button
            type="button"
            className={`store-filter-toggle ${open ? "open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {filter === "todos" ? "todos os produtos" : filter}
            <span className="project-grid-toggle-arrow">⌄</span>
          </button>

          {open && (
            <div className="store-filter-dropdown">
              <button type="button" onClick={() => select("todos")}>
                todos os produtos
              </button>
              {categories.map((c) => (
                <button key={c} type="button" onClick={() => select(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="store-grid">
        {visible.map((p) => (
          <Link key={p.id} href={`/loja/${p.slug}`} className="store-card">
            {p.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
              <img src={p.imageUrls[0]} alt={p.name} className="store-card-cover" />
            ) : (
              <div className="store-card-placeholder-cover" aria-hidden="true">
                <span className="initial">{p.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="store-card-info">
              <span className="store-card-name">{p.name}</span>
              <span className="mono store-card-price">{formatBRL(p.priceCents)}</span>
            </div>
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="project-grid-empty mono">
            <span className="plus">+</span>
            <span>em breve</span>
          </div>
        )}
      </div>
    </>
  );
}
