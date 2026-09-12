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
      </div>

      <div className="add-to-cart-actions">
        <button type="button" className="btn-solid" onClick={handleBuyNow}>
          comprar agora
        </button>
        <button
          type="button"
          className={`add-to-cart-secondary ${justAdded ? "added" : ""}`}
          onClick={handleAddToCart}
        >
          {justAdded ? "adicionado ✓" : "+ adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );
}
