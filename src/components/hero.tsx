"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandObject } from "./brand-object";
import { SiteMenu } from "./site-menu";
import { Logo } from "./logo";

const LAUNCH_DURATION_MS = 650;

export function Hero() {
  const router = useRouter();
  const [charged, setCharged] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handleCharged = useCallback(() => {
    setCharged(true);
    // "carrega" e depois lança — o objeto cresce/funde em preto antes de
    // trocar de página, em vez de sumir na hora sem transição nenhuma.
    window.setTimeout(() => {
      setLaunching(true);
      window.setTimeout(() => router.push("/portfolio"), LAUNCH_DURATION_MS);
    }, 150);
  }, [router]);

  return (
    <section className="hero">
      <Logo />
      <SiteMenu />

      <div className="hero-center">
        <div className={`hero-object ${charged ? "charged" : ""} ${launching ? "launching" : ""}`}>
          <BrandObject onCharged={handleCharged} shape="monograma" />
        </div>
        <Link href="/portfolio" className="hero-projects-link mono">
          ver todos os projetos
        </Link>
        <Link href="/loja" className="hero-store-cta mono">
          ver loja
        </Link>
      </div>

      <span className="hero-hold-hint mono">clique e segure</span>

      <div className={`hero-launch-overlay ${launching ? "active" : ""}`} aria-hidden="true" />
    </section>
  );
}
