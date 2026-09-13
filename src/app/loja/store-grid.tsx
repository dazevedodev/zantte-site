"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/store/types";
import { ProductCard } from "./product-card";

type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "mais-vendidos" | "recentes";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "relevância" },
  { value: "menor-preco", label: "menor preço" },
  { value: "maior-preco", label: "maior preço" },
  { value: "mais-vendidos", label: "mais vendidos" },
  { value: "recentes", label: "mais recentes" },
];

// busca simples client-side (sem acento) — catálogo já vem inteiro pro
// navegador, então filtrar em memória é instantâneo e dispensa rota nova.
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function StoreGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const [filter, setFilter] = useState<string | "todos">("todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [sortOpen, setSortOpen] = useState(false);

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    let list = filter === "todos" ? products : products.filter((p) => p.category === filter);

    const q = normalize(query.trim());
    if (q) {
      list = list.filter(
        (p) => normalize(p.name).includes(q) || (p.category ? normalize(p.category).includes(q) : false),
      );
    }

    list = [...list];
    switch (sort) {
      case "menor-preco":
        list.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "maior-preco":
        list.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "mais-vendidos":
        list.sort((a, b) => b.unitsSold - a.unitsSold);
        break;
      case "recentes":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return list;
  }, [products, filter, query, sort]);

  return (
    <>
      <div className="store-toolbar">
        <div className="store-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="buscar produtos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="store-sort">
          <button
            type="button"
            className="store-sort-toggle"
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            filtrar
          </button>

          {sortOpen && (
            <>
              <button
                type="button"
                className="store-sort-backdrop"
                aria-label="fechar"
                onClick={() => setSortOpen(false)}
              />
              <div className="store-sort-panel">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={sort === o.value ? "active" : ""}
                    onClick={() => {
                      setSort(o.value);
                      setSortOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="store-category-pills">
          <button
            type="button"
            className={filter === "todos" ? "active" : ""}
            onClick={() => setFilter("todos")}
          >
            todos
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={filter === c ? "active" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="store-grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {visible.length === 0 && searching && (
          <div className="store-grid-empty">
            <span className="plus">×</span>
            <span>nenhum resultado pra &quot;{query}&quot;</span>
          </div>
        )}
        {visible.length === 0 && !searching && (
          <div className="store-grid-empty">
            <span className="plus">+</span>
            <span>em breve</span>
          </div>
        )}
      </div>
    </>
  );
}
