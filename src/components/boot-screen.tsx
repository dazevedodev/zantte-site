"use client";

import { useEffect, useState } from "react";
import { BrandObject } from "./brand-object";
import { prefersReducedMotion } from "@/lib/motion";

const SESSION_KEY = "zantte-booted";
const LINE_DURATION_MS = 1300;
const HOLD_MS = 350;
const EXIT_MS = 500;

type Phase = "lines" | "hold" | "exiting" | "done";

export function BootScreen() {
  const [phase, setPhase] = useState<Phase>("lines");
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // "visible" já começa false — não precisa de setState pra "desligar" o
    // boot screen nesses casos, só não liga ele (fica null pelo check embaixo).
    if (sessionStorage.getItem(SESSION_KEY) || prefersReducedMotion()) {
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.style.overflow = "hidden";

    // Os dois setState ficam dentro do rAF (não direto no corpo do efeito) —
    // além de "started" precisar mesmo de um frame de atraso pra CSS animar
    // a partir do estado inicial, isso evita disparar setState síncrono
    // direto no efeito.
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      requestAnimationFrame(() => setStarted(true));
    });

    const t1 = window.setTimeout(() => setPhase("hold"), LINE_DURATION_MS);
    const t2 = window.setTimeout(() => setPhase("exiting"), LINE_DURATION_MS + HOLD_MS);
    const t3 = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, LINE_DURATION_MS + HOLD_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done" || !visible) return null;

  return (
    <div className={`boot-screen ${phase === "exiting" ? "exiting" : ""}`} aria-hidden="true">
      <div className="boot-object">
        <BrandObject onCharged={() => {}} shape="monograma" />
      </div>
      <div className="boot-line">
        <span className={`boot-line-half boot-line-left ${started ? "grow" : ""}`} />
        <span className={`boot-line-half boot-line-right ${started ? "grow" : ""}`} />
      </div>
    </div>
  );
}
