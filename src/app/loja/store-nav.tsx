"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store/cart";

export function StoreNav() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const backHref = pathname === "/loja" ? "/" : "/loja";

  return (
    <header className="store-nav">
      <Link href={backHref} className="store-nav-back">
        ← voltar
      </Link>

      <Link href="/loja" className="store-nav-wordmark">
        ZAN CO.
      </Link>

      <Link href="/loja/carrinho" className="store-nav-cart" aria-label="carrinho">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 4h2l2.2 11.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="21" r="1.4" />
          <circle cx="17" cy="21" r="1.4" />
        </svg>
        {totalCount > 0 && <span className="store-nav-cart-count">{totalCount}</span>}
      </Link>
    </header>
  );
}
