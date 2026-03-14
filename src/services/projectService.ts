import type { Project } from "../models/Project";

const STORAGE_KEY = "manage-me-projects";
const ACTIVE_PROJECT_KEY = "manage-me-active-project";

function readProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Project[];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}


export const projectService = {
  getAll(): Project[] {
    return readProjects();
  },

  getById(id: string): Project | undefined {
    return readProjects().find((project) => project.id === id);
  },

  create(project: Project): void {
    const projects = readProjects();
    projects.push(project);
    saveProjects(projects);
  },

  update(updatedProject: Project): void {
    const projects = readProjects().map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );
    saveProjects(projects);
  },

  delete(id: string): void {
    const projects = readProjects().filter((project) => project.id !== id);
    saveProjects(projects);
  },

  setActiveProject(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  },

  getActiveProject(): Project | null {
  const id = localStorage.getItem(ACTIVE_PROJECT_KEY);

  if (!id) return null;

  return this.getById(id) ?? null;
  }
};