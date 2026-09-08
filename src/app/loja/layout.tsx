import { CartProvider } from "@/lib/store/cart";
import { StoreNav } from "./store-nav";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-theme">
      <CartProvider>
        <StoreNav />
        {children}
      </CartProvider>
    </div>
  );
}
