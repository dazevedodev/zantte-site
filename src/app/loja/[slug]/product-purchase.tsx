"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBRL, formatSoldCount, discountPercent } from "@/lib/store/format";
import { useCart } from "@/lib/store/cart";
import type { Product, ProductVariant, ShippingType } from "@/lib/store/types";
import { ProductGallery } from "./product-gallery";
import { ProductHighlights } from "./product-highlights";
import { AddToCartButton } from "./add-to-cart-button";
import { ShippingEstimate } from "./shipping-estimate";
import { TrustBadges } from "../trust-badges";
import { PaymentMethods } from "../payment-methods";

// junta galeria, seletor de cor e botão de compra num componente client só
// — a cor escolhida precisa trocar a foto em destaque (na galeria) E ir
// junto no item do carrinho (no botão), então os dois precisam do mesmo
// estado, o que não dá pra fazer com a galeria e o botão soltos na page
// (server component) como antes.
export function ProductPurchase({
  productId,
  slug,
  name,
  category,
  description,
  priceCents,
  compareAtPriceCents,
  images,
  videoUrl,
  variants,
  unitsSold,
  shippingType,
  discountPercent: discountPct,
  crossSell,
}: {
  productId: string;
  slug: string;
  name: string;
  category: string | null;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  images: string[];
  videoUrl: string | null;
  variants: ProductVariant[];
  unitsSold: number;
  shippingType: ShippingType | null;
  discountPercent: number | null;
  crossSell: Product | null;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null);
  const { addItem, openDrawer } = useCart();
  const [crossSellAdded, setCrossSellAdded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const crossSellRef = useRef<HTMLDivElement>(null);
  const infoContentRef = useRef<HTMLDivElement>(null);
  const buyRowRef = useRef<HTMLDivElement>(null);

  // ao navegar de um produto pra outro (ex: pelo "leve também" ou pelos
  // relacionados), o Next as vezes mantém o scroll onde a pessoa estava —
  // aqui garante que toda página de produto sempre abre do topo.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // alinha o fim da linha de comprar com o fim do "leve também", sempre —
  // compactar a descrição (ProductHighlights) já ajuda, mas nome/categoria/
  // desconto/frete variam de produto pra produto e ainda podiam deixar uns
  // px de diferença. Em vez de tentar acertar isso só no CSS (as duas
  // colunas rolam de forma independente), mede as duas depois de cada
  // render e empurra a linha de comprar com a distância exata que falta —
  // sempre que a galeria (imagem carregando) ou o conteúdo da coluna de
  // info (nome quebrando linha, "ver mais") mudam de altura.
  useEffect(() => {
    const crossSellEl = crossSellRef.current;
    const infoContentEl = infoContentRef.current;
    const buyRowEl = buyRowRef.current;
    if (!crossSellEl || !buyRowEl) return;

    let raf = 0;
    function align() {
      if (!crossSellEl || !buyRowEl) return;
      buyRowEl.style.marginTop = "0px";
      const crossSellBottom = crossSellEl.getBoundingClientRect().bottom;
      const buyRowBottom = buyRowEl.getBoundingClientRect().bottom;
      const delta = crossSellBottom - buyRowBottom;
      buyRowEl.style.marginTop = delta > 0 ? `${delta}px` : "0px";
    }

    function scheduleAlign() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(align);
    }

    scheduleAlign();
    const observer = new ResizeObserver(scheduleAlign);
    observer.observe(crossSellEl);
    if (infoContentEl) observer.observe(infoContentEl);
    window.addEventListener("resize", scheduleAlign);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", scheduleAlign);
    };
  }, [crossSell, images, description]);

  const soldLabel = formatSoldCount(unitsSold);
  const crossSellHasDiscount =
    crossSell?.compareAtPriceCents && crossSell.compareAtPriceCents > crossSell.priceCents;

  function handleApplyCoupon() {
    setCouponMessage(couponCode.trim() ? "cupons chegando em breve por aqui" : "digite um cupom");
  }

  function handleAddCrossSell() {
    if (!crossSell) return;
    addItem({
      productId: crossSell.id,
      slug: crossSell.slug,
      name: crossSell.name,
      priceCents: crossSell.priceCents,
      imageUrl: crossSell.imageUrls[0] ?? null,
      variantName: null,
    });
    setCrossSellAdded(true);
    setTimeout(() => setCrossSellAdded(false), 1500);
    openDrawer();
  }

  return (
    <>
      <div className="product-gallery-column">
        <ProductGallery
          images={images}
          name={name}
          discountPercent={discountPct}
          videoUrl={videoUrl}
          variants={variants}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />

        {crossSell && (
          <div className="product-cross-sell" ref={crossSellRef}>
            <span className="product-cross-sell-label">
              {crossSellHasDiscount ? "aproveite essa oferta e leve também" : "combine com"}
            </span>
            <div className="product-cross-sell-item">
              <Link href={`/loja/${crossSell.slug}`} className="product-cross-sell-link">
                {crossSell.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem vem do Blob, sem otimização necessária aqui.
                  <img src={crossSell.imageUrls[0]} alt={crossSell.name} className="product-cross-sell-image" />
                ) : (
                  <div className="product-cross-sell-image product-cross-sell-placeholder" aria-hidden="true">
                    {crossSell.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="product-cross-sell-info">
                  <span className="product-cross-sell-name">{crossSell.name}</span>
                  <span className="product-cross-sell-price-row">
                    {crossSellHasDiscount && (
                      <span className="product-cross-sell-price-compare">
                        {formatBRL(crossSell.compareAtPriceCents!)}
                      </span>
                    )}
                    <span className="product-cross-sell-price">{formatBRL(crossSell.priceCents)}</span>
                    {crossSellHasDiscount && (
                      <span className="product-cross-sell-discount">
                        -{discountPercent(crossSell.compareAtPriceCents!, crossSell.priceCents)}%
                      </span>
                    )}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className={`product-cross-sell-add ${crossSellAdded ? "added" : ""}`}
                onClick={handleAddCrossSell}
              >
                {crossSellAdded ? "adicionado ✓" : "+ adicionar"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="product-detail-info">
        <div className="product-info-content" ref={infoContentRef}>
          {(category || soldLabel) && (
            <div className="product-detail-badges">
              {category && <span className="product-detail-badge">{category}</span>}
              {soldLabel && <span className="product-detail-badge accent">{soldLabel}</span>}
            </div>
          )}

          <h1 className="display product-detail-name">{name}</h1>
          <div className="product-detail-top-row">
            <div className="product-detail-price-stack">
              {compareAtPriceCents && (
                <span className="product-detail-price-compare">{formatBRL(compareAtPriceCents)}</span>
              )}
              <span className="product-detail-price">{formatBRL(priceCents)}</span>
              <div className="product-coupon">
                <input
                  type="text"
                  placeholder="cupom de desconto"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponMessage(null);
                  }}
                />
                <button type="button" onClick={handleApplyCoupon}>
                  aplicar
                </button>
              </div>
              {couponMessage && <span className="product-coupon-message">{couponMessage}</span>}
            </div>
            <div className="product-payment-top">
              <TrustBadges />
              <PaymentMethods />
            </div>
          </div>

          {description && <ProductHighlights text={description} />}
          {shippingType && <ShippingEstimate productId={productId} />}
        </div>

        <div className="product-buy-row" ref={buyRowRef}>
          <AddToCartButton
            productId={productId}
            slug={slug}
            name={name}
            priceCents={priceCents}
            imageUrl={selectedVariant?.imageUrl ?? images[0] ?? null}
            variantName={selectedVariant?.name ?? null}
          />
        </div>
      </div>
    </>
  );
}
