import { CartProvider } from "@/lib/store/cart";
import { listActiveProducts } from "@/lib/store/products";
import { StoreNav } from "./store-nav";
import { CartDrawer } from "./cart-drawer";

// o drawer do carrinho busca produtos pra sugestão de complemento em toda
// página da loja — precisa ser dinâmico (sem isso, o build tenta gerar
// /loja/carrinho estaticamente e quebra tentando bater no banco em build time).
export const dynamic = "force-dynamic";

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const products = await listActiveProducts();

  return (
    <div className="store-theme">
      <CartProvider>
        <StoreNav />
        {children}
        <CartDrawer products={products} />
      </CartProvider>
    </div>
  );
}
