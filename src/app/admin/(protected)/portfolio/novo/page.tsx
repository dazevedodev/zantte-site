import { createPortfolioProjectAction } from "../actions";
import { PortfolioForm } from "../portfolio-form";

export default function NewPortfolioProjectPage() {
  return (
    <section className="admin-page">
      <h1 className="display admin-page-heading">novo projeto</h1>
      <PortfolioForm action={createPortfolioProjectAction} />
    </section>
  );
}
