"use client";

import { useRef, useState } from "react";
import type { ProductVariant } from "@/lib/store/types";

export function ProductGallery({
  images,
  name,
  discountPercent,
  videoUrl = null,
  variants = [],
  selectedVariant = null,
  onSelectVariant,
}: {
  images: string[];
  name: string;
  discountPercent: number | null;
  videoUrl?: string | null;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (variant: ProductVariant) => void;
}) {
  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zooming, setZooming] = useState(false);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const hasVariants = variants.length > 0;

  // segue o cursor de verdade (não só "scale no centro") — escreve direto
  // no DOM via ref em vez de guardar x/y no state, pra não re-renderizar o
  // componente inteiro a cada pixel de movimento do mouse.
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const img = mainImageRef.current;
    if (!img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  }

  if (images.length === 0 && !hasVariants && !videoUrl) {
    return (
      <div className="product-detail-media">
        <div className="store-card-placeholder-cover" aria-hidden="true">
          <span className="initial">{name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  // com variações, a foto em destaque segue a cor escolhida — o rail de
  // miniaturas simples (navegação por índice) não faz sentido nesse caso.
  const activeUrl = hasVariants ? (selectedVariant?.imageUrl ?? variants[0].imageUrl) : images[active];

  function selectImage(index: number) {
    setShowVideo(false);
    setActive(index);
  }

  function selectVariant(variant: ProductVariant) {
    setShowVideo(false);
    onSelectVariant?.(variant);
  }

  return (
    <div className="product-gallery">
      {hasVariants ? (
        <div className="product-gallery-thumbs product-variant-picker">
          {variants.map((variant) => (
            <button
              key={variant.name}
              type="button"
              className={`product-variant-swatch ${!showVideo && selectedVariant?.name === variant.name ? "active" : ""}`}
              onClick={() => selectVariant(variant)}
              aria-label={`cor ${variant.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
              <img src={variant.imageUrl} alt="" />
              <span>{variant.name}</span>
            </button>
          ))}
          {videoUrl && (
            <button
              type="button"
              className={`product-variant-swatch product-gallery-video-thumb ${showVideo ? "active" : ""}`}
              onClick={() => setShowVideo(true)}
              aria-label="ver vídeo do produto"
            >
              <span className="product-gallery-play">▶</span>
              <span>Vídeo</span>
            </button>
          )}
        </div>
      ) : (
        (images.length > 1 || videoUrl) && (
          <div className="product-gallery-thumbs">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                className={`product-gallery-thumb ${!showVideo && i === active ? "active" : ""}`}
                onClick={() => selectImage(i)}
                aria-label={`foto ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui. */}
                <img src={url} alt="" />
              </button>
            ))}
            {videoUrl && (
              <button
                type="button"
                className={`product-gallery-thumb product-gallery-video-thumb ${showVideo ? "active" : ""}`}
                onClick={() => setShowVideo(true)}
                aria-label="ver vídeo do produto"
              >
                <span className="product-gallery-play">▶</span>
              </button>
            )}
          </div>
        )
      )}

      <div
        className={`product-detail-media ${zooming && !showVideo ? "zooming" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
      >
        {discountPercent !== null && <span className="sale-badge">-{discountPercent}%</span>}
        {showVideo && videoUrl ? (
          <video src={videoUrl} controls autoPlay className="product-gallery-main" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
          <img ref={mainImageRef} src={activeUrl} alt={name} className="product-gallery-main" />
        )}
      </div>
    </div>
  );
}
