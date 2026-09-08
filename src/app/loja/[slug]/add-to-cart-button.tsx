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
}: {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);

  function handleAddToCart() {
    addItem({ productId, slug, name, priceCents, imageUrl }, quantity);
    openDrawer();
  }

  function handleBuyNow() {
    addItem({ productId, slug, name, priceCents, imageUrl }, quantity);
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
        <button type="button" className="add-to-cart-secondary" onClick={handleAddToCart}>
          + adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
