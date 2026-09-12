import Link from "next/link";
import { SiteMenu } from "@/components/site-menu";
import { WHATSAPP_URL, INSTAGRAM_URL, CONTACT_EMAIL } from "@/lib/site-config";

const CONTACT_LINKS = [
  { href: WHATSAPP_URL, label: "whatsapp", icon: "/icons/whatsapp.png" },
  { href: INSTAGRAM_URL, label: "instagram", icon: "/icons/instagram.png" },
  { href: `mailto:${CONTACT_EMAIL}`, label: "email", icon: "/icons/mail.png" },
] as const;

export default function ContatoPage() {
  return (
    <div className="simple-page-pastel contact-page">
      <SiteMenu />
      <Link href="/" className="site-logo display simple-page-logo" aria-label="zantte">
        zantte
      </Link>

      <div className="contact-icons">
        {CONTACT_LINKS.map(({ href, label, icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="hero-dock-item">
            <span className="hero-dock-icon">
              {/* eslint-disable-next-line @next/next/no-img-element -- ícone 3D estático em public/, sem necessidade de otimização. */}
              <img src={icon} alt="" />
            </span>
            <span className="hero-dock-label">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
