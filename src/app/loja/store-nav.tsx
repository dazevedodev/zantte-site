"use client";

import Link from "next/link";
import { useCart } from "@/lib/store/cart";

export function StoreNav() {
  const { totalCount } = useCart();

  return (
    <header className="store-nav">
      {/* retorno pro site principal — só o wordmark, preto, sem seta nem
          caixa, mesmo tratamento (.site-logo) usado no resto do site. */}
      <Link href="/" className="site-logo display store-nav-back" aria-label="zantte">
        ZANTTE
      </Link>

      <div className="store-nav-actions">
        <Link href="/loja#loja-toolbar" className="store-nav-search" aria-label="buscar produtos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
        </Link>

        <Link href="/loja/carrinho" className="store-nav-cart" aria-label="carrinho">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="21" r="1.4" />
            <circle cx="17" cy="21" r="1.4" />
          </svg>
          {totalCount > 0 && <span className="store-nav-cart-count">{totalCount}</span>}
        </Link>
      </div>
    </header>
  );
}
