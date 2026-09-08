"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const FIRED_KEY_PREFIX = "zantte_purchase_fired_";

// dispara o evento Purchase do Meta Pixel só uma vez por pedido — a pessoa
// pode recarregar/revisitar essa página várias vezes, e cada disparo extra
// contaria como uma venda nova nos relatórios de anúncio.
export function PurchasePixel({ orderId, amountCents }: { orderId: string; amountCents: number }) {
  useEffect(() => {
    const key = `${FIRED_KEY_PREFIX}${orderId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.fbq?.("track", "Purchase", {
        value: amountCents / 100,
        currency: "BRL",
      });
      window.sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage indisponível — pior caso é registrar o evento de novo
      // numa próxima visita, não vale travar a página por causa disso.
      window.fbq?.("track", "Purchase", { value: amountCents / 100, currency: "BRL" });
    }
  }, [orderId, amountCents]);

  return null;
}
