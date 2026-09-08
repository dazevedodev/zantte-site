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
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, slug, name, priceCents, imageUrl }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
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

      <button type="button" className="btn-solid" onClick={handleAdd}>
        {added ? "adicionado ✓" : "adicionar ao carrinho"}
      </button>

      {added && (
        <button type="button" className="add-to-cart-go" onClick={() => router.push("/loja/carrinho")}>
          ver carrinho →
        </button>
      )}
    </div>
  );
}
