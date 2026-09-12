"use client";

import { useState } from "react";
import { formatBRL, formatSoldCount } from "@/lib/store/format";
import type { ProductVariant, ShippingType } from "@/lib/store/types";
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
  description,
  priceCents,
  compareAtPriceCents,
  images,
  videoUrl,
  variants,
  unitsSold,
  shippingType,
  discountPercent,
}: {
  productId: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  images: string[];
  videoUrl: string | null;
  variants: ProductVariant[];
  unitsSold: number;
  shippingType: ShippingType | null;
  discountPercent: number | null;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null);

  return (
    <>
      <ProductGallery
        images={images}
        name={name}
        discountPercent={discountPercent}
        videoUrl={videoUrl}
        variants={variants}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
      />

      <div className="product-detail-info">
        <h1 className="display product-detail-name">{name}</h1>
        <div className="product-detail-price-stack">
          {compareAtPriceCents && (
            <span className="product-detail-price-compare">{formatBRL(compareAtPriceCents)}</span>
          )}
          <span className="product-detail-price">{formatBRL(priceCents)}</span>
        </div>
        {formatSoldCount(unitsSold) && (
          <span className="product-detail-sold">{formatSoldCount(unitsSold)}</span>
        )}
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

        <PaymentMethods />
        <TrustBadges />
      </div>
    </>
  );
}
