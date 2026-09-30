"use client";

import { useActionState, useEffect, useState } from "react";
import { regeneratePixAction, type PixState } from "./actions";

export function PixPanel({
  orderId,
  pixQrCode,
  pixQrCodeBase64,
  pixExpiresAt,
  mpInitPoint,
}: {
  orderId: string;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  pixExpiresAt: string | null;
  mpInitPoint: string | null;
}) {
  const [state, formAction, pending] = useActionState<PixState, FormData>(
    regeneratePixAction.bind(null, orderId),
    null,
  );
  const [copied, setCopied] = useState(false);

  // o "expirado" só é decidido depois de montar no navegador (relógio do
  // cliente) — decidir isso já no primeiro render (servidor) arriscava um
  // descompasso de alguns instantes entre o relógio do servidor e o do
  // navegador virar um aviso de hidratação do React.
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!pixExpiresAt) return;
    const check = () => setExpired(Date.now() >= new Date(pixExpiresAt).getTime());
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [pixExpiresAt]);

  const hasCode = Boolean(pixQrCode && pixQrCodeBase64) && !expired;

  async function copyCode() {
    if (!pixQrCode) return;
    try {
      await navigator.clipboard.writeText(pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard bloqueado (raro) — o campo continua selecionável na mão.
    }
  }

  if (!hasCode) {
    return (
      <div className="pix-panel pix-panel-empty">
        {state?.error && <p className="buy-form-error">{state.error}</p>}
        <form action={formAction}>
          <button type="submit" className="btn-solid" disabled={pending}>
            {pending ? "gerando pix..." : pixExpiresAt ? "gerar novo código pix" : "pagar com pix"}
          </button>
        </form>
        {mpInitPoint && (
          <a href={mpInitPoint} className="pix-card-link">
            ou pagar com cartão
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="pix-panel">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada na hora (base64), não é asset estático. */}
      <img src={`data:image/png;base64,${pixQrCodeBase64}`} alt="QR code do Pix" className="pix-qr" />
      <p className="pix-hint">escaneia o QR code ou copia o código no app do seu banco</p>
      <div className="pix-code-row">
        <input
          readOnly
          value={pixQrCode ?? ""}
          onFocus={(e) => e.currentTarget.select()}
          className="pix-code-input"
          aria-label="código pix copia e cola"
        />
        <button type="button" onClick={copyCode} className="btn-solid pix-copy-btn">
          {copied ? "copiado ✓" : "copiar código"}
        </button>
      </div>
      <p className="pix-hint pix-hint-persist">
        essa tela não perde o código — pode fechar e voltar aqui pra pagar quando quiser, antes de expirar.
      </p>
      {mpInitPoint && (
        <a href={mpInitPoint} className="pix-card-link">
          prefere pagar com cartão?
        </a>
      )}
    </div>
  );
}
