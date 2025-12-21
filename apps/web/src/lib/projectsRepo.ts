import { apiClient } from "./apiClient";

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ListProjectsParams {
  workspaceId: string;
  range?: [number, number];
  sort?: { field: string; order: "ASC" | "DESC" };
}

// LocalStorage implementation (minimal mock)
// Projects are workspace-scoped, so for localStorage mode we'll use in-memory storage
// This is a temporary solution until full API integration
class LocalStorageProjectsRepo {
  private projects: Project[] = [];

  async listProjects(params: ListProjectsParams): Promise<{ data: Project[]; total: number }> {
    let projects = this.projects.filter((p) => p.workspaceId === params.workspaceId);

    if (params.sort) {
      projects.sort((a, b) => {
        const aVal = (a as any)[params.sort!.field];
        const bVal = (b as any)[params.sort!.field];
        if (params.sort!.order === "ASC") {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    const total = projects.length;

    if (params.range) {
      const [start, end] = params.range;
      projects = projects.slice(start, end + 1);
    }

    return { data: projects, total };
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) || null;
  }

  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(project);
    return project;
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.projects.splice(index, 1);
    return true;
  }
}

// API implementation
class ApiProjectsRepo {
  async listProjects(params: ListProjectsParams): Promise<{ data: Project[]; total: number }> {
    const filter = { workspaceId: params.workspaceId };

    const queryParams = new URLSearchParams();
    queryParams.set("filter", JSON.stringify(filter));

    if (params.sort) {
      queryParams.set("sort", JSON.stringify(params.sort));
    }

    if (params.range) {
      queryParams.set("range", JSON.stringify(params.range));
    }

    const response = await apiClient.get<Project[]>(`/projects?${queryParams.toString()}`);
    const total = response.length || 0;

    return { data: response, total };
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      return await apiClient.get<Project>(`/projects/${id}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    return apiClient.post<Project>("/projects", data);
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
    try {
      return await apiClient.patch<Project>(`/projects/${id}`, patch);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/projects/${id}`);
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

// Export based on feature flag
const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export const projectsRepo = USE_API ? new ApiProjectsRepo() : new LocalStorageProjectsRepo();

