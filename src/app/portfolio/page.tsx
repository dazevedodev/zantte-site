import Link from "next/link";
import { listActivePortfolioProjects } from "@/lib/portfolio";
import { PortfolioCarousel } from "./portfolio-carousel";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const projects = await listActivePortfolioProjects();

  return (
    <div className="portfolio-carousel-page">
      <Link href="/" className="site-logo display portfolio-carousel-logo" aria-label="zantte">
        zantte
      </Link>

      <PortfolioCarousel projects={projects} />
    </div>
  );
}
