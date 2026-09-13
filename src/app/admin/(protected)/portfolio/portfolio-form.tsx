"use client";

import { useActionState, useState } from "react";
import type { PortfolioFormState } from "./actions";

export function PortfolioForm({
  action,
  defaultValues,
}: {
  action: (prevState: PortfolioFormState, formData: FormData) => Promise<PortfolioFormState>;
  defaultValues?: {
    name: string;
    tagline: string;
    url: string;
    coverUrl: string;
  };
}) {
  const [state, formAction, pending] = useActionState<PortfolioFormState, FormData>(action, null);
  const [coverUrl, setCoverUrl] = useState(defaultValues?.coverUrl ?? "");
  const [coverPreview, setCoverPreview] = useState(defaultValues?.coverUrl ?? "");
  const [removeCover, setRemoveCover] = useState(false);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  }

  function clearCover() {
    setCoverUrl("");
    setCoverPreview("");
    setRemoveCover(true);
  }

  return (
    <form action={formAction} className="admin-product-form" encType="multipart/form-data">
      <input type="hidden" name="existingCoverUrl" value={coverUrl} />
      <input type="hidden" name="removeCover" value={removeCover ? "true" : "false"} />

      <label className="mono label" htmlFor="name">
        nome
      </label>
      <input id="name" name="name" defaultValue={defaultValues?.name} required />

      <label className="mono label" htmlFor="tagline">
        legenda embaixo do nome (opcional)
      </label>
      <input
        id="tagline"
        name="tagline"
        placeholder="ex: tecnologia que resolve problemas reais"
        defaultValue={defaultValues?.tagline}
      />

      <label className="mono label" htmlFor="url">
        link do projeto (opcional)
      </label>
      <input id="url" name="url" placeholder="https://..." defaultValue={defaultValues?.url} />

      <label className="mono label" htmlFor="cover">
        capa
      </label>
      {coverPreview && (
        <div className="admin-image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- preview local, sem necessidade de otimização. */}
          <img src={coverPreview} alt="" />
          <button type="button" onClick={clearCover}>
            remover
          </button>
        </div>
      )}
      <input id="cover" name="cover" type="file" accept="image/*" onChange={handleCoverChange} />
      <p className="buy-form-hint">dimensão ideal: 1600×1000px (proporção 16:10).</p>

      {state?.error && <p className="buy-form-error">{state.error}</p>}

      <button type="submit" className="btn-solid" disabled={pending}>
        {pending ? "salvando..." : "salvar"}
      </button>
    </form>
  );
}
