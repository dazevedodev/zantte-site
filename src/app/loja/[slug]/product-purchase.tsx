"use client";

import { useState } from "react";
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

  const soldLabel = formatSoldCount(unitsSold);
  const crossSellHasDiscount =
    crossSell?.compareAtPriceCents && crossSell.compareAtPriceCents > crossSell.priceCents;

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
          <div className="product-cross-sell">
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
          </div>
          <div className="product-payment-top">
            <PaymentMethods />
            <span className="product-payment-secure">pagamento seguro · Mercado Pago</span>
            <TrustBadges />
          </div>
        </div>

        {description && <ProductHighlights text={description} />}
        {shippingType && <ShippingEstimate productId={productId} />}

        <AddToCartButton
          productId={productId}
          slug={slug}
          name={name}
          priceCents={priceCents}
          imageUrl={selectedVariant?.imageUrl ?? images[0] ?? null}
          variantName={selectedVariant?.name ?? null}
        />
      </div>
    </>
  );
}
