"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const SESSION_KEY = "zantte-booted";
const ENTER_MS = 550;
const HOLD_MS = 500;
const EXIT_MS = 450;

type Phase = "entering" | "hold" | "exiting" | "done";

export function BootScreen() {
  const [phase, setPhase] = useState<Phase>("entering");
  // Começa visível (cobre a tela desde o primeiro paint) — se começasse
  // false, o HTML inicial não tinha o overlay nenhum, e o conteúdo da
  // página (hero) ficava exposto por um instante antes do JS decidir
  // mostrar o boot, causando o flash "abre o site antes da animação".
  // Nos casos em que o boot deve ser pulado (sessão já viu, reduced
  // motion), o efeito abaixo desliga de volta antes de qualquer traço
  // de animação — o usuário só vê um frame do overlay estático, nunca
  // o conteúdo por trás dele.
  const [visible, setVisible] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) || prefersReducedMotion()) {
      // setState fora do corpo síncrono do efeito (regra react-hooks/set-state-in-effect).
      const skip = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(skip);
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.style.overflow = "hidden";

    // "started" precisa de um frame de atraso pra CSS animar a partir do
    // estado inicial (0 -> cresce), por isso fica num rAF em vez de direto
    // no corpo do efeito.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setStarted(true));
    });

    const t1 = window.setTimeout(() => setPhase("hold"), ENTER_MS);
    const t2 = window.setTimeout(() => setPhase("exiting"), ENTER_MS + HOLD_MS);
    const t3 = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, ENTER_MS + HOLD_MS + EXIT_MS);

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
      <div className={`boot-mascot-wrap ${started ? "in" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- mesmo ícone estático do mascote em public/, sem necessidade de otimização. */}
        <img src="/icons/mascot.png" alt="" className="boot-mascot" />
      </div>
      <span className={`boot-wordmark ${started ? "in" : ""}`}>zantte</span>
    </div>
  );
}
