import Link from "next/link";
import { SiteMenu } from "@/components/site-menu";

const DOCK = [
  { href: "/loja", label: "store", icon: "/icons/loja.png" },
  { href: "/portfolio", label: "portfolio", icon: "/icons/portfolio.png" },
  { href: "/contato", label: "contact", icon: "/icons/contato.png" },
] as const;

export function Hero() {
  return (
    <section className="hero hero-pastel">
      <Link href="/" className="site-logo display hero-logo" aria-label="zantte">
        zantte
      </Link>

      <SiteMenu />

      <div className="hero-statement">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
        <img src="/icons/mascot.png" alt="zantte" className="hero-mascot" />
      </div>

      <nav className="hero-dock">
        {DOCK.map(({ href, label, icon }) => (
          <Link key={href} href={href} className="hero-dock-item">
            <span className="hero-dock-icon">
              {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
              <img src={icon} alt="" />
            </span>
            <span className="hero-dock-label">{label}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
