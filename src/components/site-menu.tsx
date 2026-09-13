"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { href: "/loja", label: "store", icon: "/icons/loja.png" },
  { href: "/portfolio", label: "portfolio", icon: "/icons/portfolio.png" },
  { href: "/sobre", label: "about us", icon: null },
  { href: "/contato", label: "contact", icon: "/icons/contato.png" },
] as const;

export function SiteMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`site-menu-toggle ${open ? "open" : ""}`}
        aria-label={open ? "fechar menu" : "abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <button
          type="button"
          className="site-menu-backdrop"
          aria-label="fechar menu"
          onClick={() => setOpen(false)}
        />
      )}

      <nav className={`site-menu-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        {ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="site-menu-item"
            tabIndex={open ? undefined : -1}
            onClick={() => setOpen(false)}
          >
            <span className="site-menu-item-icon">
              {icon && (
                // eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização.
                <img src={icon} alt="" />
              )}
            </span>
            <span className="site-menu-item-label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
