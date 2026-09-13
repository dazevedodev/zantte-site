import { notFound } from "next/navigation";
import { getPortfolioProjectById } from "@/lib/portfolio";
import { updatePortfolioProjectAction, setPortfolioProjectActiveAction } from "../actions";
import { PortfolioForm } from "../portfolio-form";
import { DeletePortfolioButton } from "./delete-portfolio-button";

export const dynamic = "force-dynamic";

export default async function EditPortfolioProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getPortfolioProjectById(id);
  if (!project) notFound();

  const action = updatePortfolioProjectAction.bind(null, project.id);
  const toggleActive = setPortfolioProjectActiveAction.bind(null, project.id, !project.active);

  return (
    <section className="admin-page">
      <div className="admin-page-head-row">
        <h1 className="display admin-page-heading">{project.name}</h1>
        <div className="admin-page-head-actions">
          <form action={toggleActive}>
            <button type="submit" className="admin-toggle-active-btn">
              {project.active ? "desativar" : "ativar"}
            </button>
          </form>
          <DeletePortfolioButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <PortfolioForm
        action={action}
        defaultValues={{
          name: project.name,
          tagline: project.tagline ?? "",
          url: project.url ?? "",
          coverUrl: project.coverUrl ?? "",
        }}
      />
    </section>
  );
}
