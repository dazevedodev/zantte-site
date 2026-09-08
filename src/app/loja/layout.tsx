import { CartProvider } from "@/lib/store/cart";
import { StoreNav } from "./store-nav";
import { CartDrawer } from "./cart-drawer";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-theme">
      <CartProvider>
        <StoreNav />
        {children}
        <CartDrawer />
      </CartProvider>
    </div>
  );
}
