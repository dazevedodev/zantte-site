"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LIGHT_UP_MS = 380;

// Wordmark "zantte" em código (não é imagem), com o mesmo acabamento "de
// vidro" (gradiente + brilho) do objeto 3D central.
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
      zantte
    </Link>
  );
}
