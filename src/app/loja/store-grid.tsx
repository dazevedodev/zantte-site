"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/store/types";
import { ProductCard } from "./product-card";

export function StoreGrid({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const [filter, setFilter] = useState<string | "todos">("todos");

  const visible = useMemo(
    () => (filter === "todos" ? products : products.filter((p) => p.category === filter)),
    [products, filter],
  );

  return (
    <>
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
        {visible.length === 0 && (
          <div className="project-grid-empty">
            <span className="plus">+</span>
            <span>em breve</span>
          </div>
        )}
      </div>
    </>
  );
}
