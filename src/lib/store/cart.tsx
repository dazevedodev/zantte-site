"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  // cor escolhida (quando o produto tem variações) — duas cores do mesmo
  // produto viram linhas separadas no carrinho, por isso entra na comparação
  // de "mesmo item" junto com o productId.
  variantName: string | null;
  quantity: number;
};

function sameLine(a: { productId: string; variantName: string | null }, b: { productId: string; variantName: string | null }) {
  return a.productId === b.productId && a.variantName === b.variantName;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantName?: string | null) => void;
  setQuantity: (productId: string, variantName: string | null, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  totalCents: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "zantte_cart";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage indisponível (modo privado etc.) — carrinho só em memória.
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // idem — falha silenciosa, carrinho continua funcionando na sessão.
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // lê o localStorage fora do corpo síncrono do efeito (regra
    // react-hooks/set-state-in-effect) — usa setTimeout, não
    // requestAnimationFrame: rAF fica pausado enquanto a aba não está
    // visível/em primeiro plano, o que travava o carrinho vazio pra sempre
    // nesse cenário. setTimeout dispara de qualquer forma.
    const timer = window.setTimeout(() => {
      setItems(readStoredCart());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) writeStoredCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item));
      if (existing) {
        return prev.map((i) => (sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantName: string | null = null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, { productId, variantName })));
  }, []);

  const setQuantity = useCallback((productId: string, variantName: string | null, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => !sameLine(i, { productId, variantName }));
      return prev.map((i) => (sameLine(i, { productId, variantName }) ? { ...i, quantity } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      totalCount,
      totalCents,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, addItem, removeItem, setQuantity, clear, totalCount, totalCents, isDrawerOpen, openDrawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
