"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { label: "sobre", href: "/sobre", position: "left" },
  { label: "projetos", href: "/portfolio", position: "center" },
  { label: "contato", href: "/contato", position: "right" },
] as const;

export function SiteMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`hero-menu ${open ? "open" : ""}`}
        aria-label={open ? "fechar menu" : "abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`site-menu-labels ${open ? "open" : ""}`} aria-hidden={!open}>
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`display site-menu-label site-menu-label-${item.position}`}
            tabIndex={open ? undefined : -1}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
