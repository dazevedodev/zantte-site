"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { formatBRL, discountPercent } from "@/lib/store/format";
import type { Product } from "@/lib/store/types";

export function CartDrawer({ products }: { products: Product[] }) {
  const { items, isDrawerOpen, closeDrawer, totalCents, removeItem, addItem } = useCart();

  // sugestão de complemento — sempre prioriza um produto que já tem
  // desconto de verdade (preço "de" cadastrado), pra parecer uma oferta
  // real, não um produto qualquer empurrado goela abaixo.
  const suggestion = useMemo(() => {
    const cartIds = new Set(items.map((i) => i.productId));
    const candidates = products.filter((p) => !cartIds.has(p.id));
    const withDiscount = candidates.find(
      (p) => p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents,
    );
    return withDiscount ?? candidates[0] ?? null;
  }, [items, products]);

  const suggestionHasDiscount =
    suggestion?.compareAtPriceCents && suggestion.compareAtPriceCents > suggestion.priceCents;

  function handleAddSuggestion() {
    if (!suggestion) return;
    addItem({
      productId: suggestion.id,
      slug: suggestion.slug,
      name: suggestion.name,
      priceCents: suggestion.priceCents,
      imageUrl: suggestion.imageUrls[0] ?? null,
    });
  }

  return (
    <div className={`cart-drawer-overlay ${isDrawerOpen ? "open" : ""}`} onClick={closeDrawer}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-head">
          <span className="label">carrinho</span>
          <button type="button" className="cart-drawer-close" onClick={closeDrawer} aria-label="fechar">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">seu carrinho está vazio.</p>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => (
                <div key={item.productId} className="cart-drawer-item">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
                    <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-image cart-item-image-placeholder" aria-hidden="true">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">
                      {item.quantity}x {formatBRL(item.priceCents)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`remover ${item.name}`}
                  >
                    remover
                  </button>
                </div>
              ))}
            </div>

            {suggestion && (
              <div className="cart-upsell">
                <span className="cart-upsell-label">
                  {suggestionHasDiscount ? "aproveite essa oferta e leve também" : "que tal levar também?"}
                </span>
                <div className="cart-upsell-product">
                  {suggestion.imageUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
                    <img src={suggestion.imageUrls[0]} alt={suggestion.name} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-image cart-item-image-placeholder" aria-hidden="true">
                      {suggestion.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="cart-item-info">
                    <span className="cart-item-name">{suggestion.name}</span>
                    <span className="cart-upsell-price-row">
                      {suggestionHasDiscount && (
                        <span className="cart-item-price cart-upsell-price-compare">
                          {formatBRL(suggestion.compareAtPriceCents!)}
                        </span>
                      )}
                      <span className="cart-item-price cart-upsell-price">{formatBRL(suggestion.priceCents)}</span>
                      {suggestionHasDiscount && (
                        <span className="cart-upsell-badge">
                          -{discountPercent(suggestion.compareAtPriceCents!, suggestion.priceCents)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <button type="button" className="cart-upsell-add" onClick={handleAddSuggestion}>
                    + adicionar
                  </button>
                </div>
              </div>
            )}

            <div className="cart-summary">
              <span>total</span>
              <span className="cart-summary-total">{formatBRL(totalCents)}</span>
            </div>

            <Link href="/loja/carrinho" className="btn-solid cart-drawer-checkout" onClick={closeDrawer}>
              finalizar compra
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
