"use client";

import { useEffect } from "react";

// A propriedade CSS user-drag não existe no Firefox — pra bloquear o
// arrastar-pra-fora em todo navegador, intercepta o próprio evento.
export function DragGuard() {
  useEffect(() => {
    function onDragStart(e: DragEvent) {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    }
    document.addEventListener("dragstart", onDragStart);
    return () => document.removeEventListener("dragstart", onDragStart);
  }, []);

  return null;
}
