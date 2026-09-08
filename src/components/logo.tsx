"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LIGHT_UP_MS = 380;

// Monograma "Z" em código (não é imagem) — mesmo traço em bloco usado no
// objeto 3D, achatado pra 2D aqui, com um acabamento "de vidro" (gradiente +
// brilho) pra combinar com o material do objeto central.
export function Logo() {
  const router = useRouter();
  const [lit, setLit] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lit) return;
    setLit(true);
    window.setTimeout(() => router.push("/"), LIGHT_UP_MS);
  };

  return (
    <Link
      href="/"
      className={`site-logo display ${lit ? "lit" : ""}`}
      aria-label="zantte"
      onClick={handleClick}
    >
      Z
    </Link>
  );
}
