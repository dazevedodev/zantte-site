"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="product-detail-media">
        <div className="store-card-placeholder-cover" aria-hidden="true">
          <span className="initial">{name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-media">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
      <img src={images[active]} alt={name} className="product-gallery-main" />

      {images.length > 1 && (
        <div className="product-gallery-thumbs">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              className={`product-gallery-thumb ${i === active ? "active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
