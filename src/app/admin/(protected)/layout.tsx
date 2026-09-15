import Link from "next/link";
import { logoutAction } from "../actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <nav className="admin-nav mono">
        <Link href="/admin/pedidos">pedidos</Link>
        <Link href="/admin/produtos">produtos</Link>
        <Link href="/admin/portfolio">portfolio</Link>
        <Link href="/" className="admin-nav-site">
          ver site ↗
        </Link>
        {/* discreto de propósito — não é sobre a loja/portfólio, é só pra
            ela mesma, por isso fica visualmente separado dos links de
            negócio acima em vez de ser "mais uma aba". */}
        <Link href="/admin/fluxo-caixa" className="admin-nav-hidden-link">
          fluxo
        </Link>
        <form action={logoutAction} className="admin-nav-logout">
          <button type="submit">sair</button>
        </form>
      </nav>
      <main>{children}</main>
    </div>
  );
}
