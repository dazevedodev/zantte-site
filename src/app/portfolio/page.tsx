import Link from "next/link";
import { Footer } from "@/components/footer";
import { ProjectGrid } from "@/components/project-grid";

export default function PortfolioPage() {
  return (
    <>
      <header className="portfolio-page-header">
        <Link href="/" className="mono">
          ← zantte
        </Link>
      </header>

      <section className="portfolio">
        <ProjectGrid />
      </section>

      <Footer />
    </>
  );
}
