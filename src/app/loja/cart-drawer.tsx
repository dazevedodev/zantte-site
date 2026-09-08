"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";
import { formatBRL } from "@/lib/store/format";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, totalCents, removeItem } = useCart();

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
