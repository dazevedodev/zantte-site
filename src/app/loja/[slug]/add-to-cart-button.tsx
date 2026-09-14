"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";

export function AddToCartButton({
  productId,
  slug,
  name,
  priceCents,
  imageUrl,
  variantName = null,
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  variantName?: string | null;
}) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    addItem({ productId, slug, name, priceCents, imageUrl, variantName }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    openDrawer();
  }

  function handleBuyNow() {
    addItem({ productId, slug, name, priceCents, imageUrl, variantName }, quantity);
    router.push("/loja/carrinho");
  }

  return (
    <div className="add-to-cart">
      <div className="add-to-cart-row">
        <label className="label" htmlFor="quantity">
          quantidade
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        />
        <button type="button" className="btn-solid buy-now-btn" onClick={handleBuyNow}>
          comprar agora
        </button>
        <button
          type="button"
          className={`cart-add-icon-btn ${justAdded ? "added" : ""}`}
          onClick={handleAddToCart}
          aria-label="adicionar ao carrinho"
          title="adicionar ao carrinho"
        >
          {justAdded ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path
                  d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="21" r="1.4" />
                <circle cx="17" cy="21" r="1.4" />
              </svg>
              <span className="cart-add-plus" aria-hidden="true">
                +
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
