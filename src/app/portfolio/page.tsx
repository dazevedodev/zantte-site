import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { PortfolioCarousel } from "./portfolio-carousel";

export default function PortfolioPage() {
  return (
    <div className="portfolio-carousel-page">
      <Link href="/" className="site-logo display portfolio-carousel-logo" aria-label="zantte">
        zantte
      </Link>

      <PortfolioCarousel projects={PROJECTS} />
    </div>
  );
}
