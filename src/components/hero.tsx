import { SiteMenu } from "@/components/site-menu";

export function Hero() {
  return (
    <section className="hero hero-pastel">
      <SiteMenu />
      <div className="hero-statement">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
        <img src="/icons/mascot.png" alt="zantte" className="hero-mascot" />
      </div>
    </section>
  );
}
