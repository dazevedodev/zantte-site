export type ProjectCategory = "sites" | "3d" | "ecommerce" | "jogos";

export const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "sites", label: "sites" },
  { id: "jogos", label: "jogos" },
  { id: "3d", label: "3d" },
  { id: "ecommerce", label: "ecommerce" },
];

export type Project = {
  name: string;
  url?: string;
  category: ProjectCategory;
  // capa opcional — quando existir, substitui o preview ao vivo do iframe.
  cover?: string;
};

export const PROJECTS: Project[] = [
  { name: "awell.com.br", url: "https://awell.com.br", category: "sites" },
  { name: "awellvivo.com.br", url: "https://awellvivo.com.br", category: "sites" },
  { name: "runtrack.com.br", url: "https://runtrack.com.br", category: "sites" },
  { name: "naviu.com.br", url: "https://naviu.com.br", category: "sites" },
];
