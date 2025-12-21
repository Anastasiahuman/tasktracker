import { Task, Status, Priority } from "@/types/task";
import { loadTasks, saveTasks, getTaskById, addTask, updateTask, deleteTask, TaskInput } from "./storage";
import { apiClient } from "./apiClient";

// Map local Status to API Status
const statusMap: Record<Status, string> = {
  "Backlog": "BACKLOG",
  "In Progress": "IN_PROGRESS",
  "Done": "DONE",
};

const statusMapReverse: Record<string, Status> = {
  "BACKLOG": "Backlog",
  "IN_PROGRESS": "In Progress",
  "DONE": "Done",
};

// Helper to safely map status
function mapStatusToLocal(apiStatus: string): Status {
  return statusMapReverse[apiStatus] || "Backlog";
}

function mapStatusToApi(localStatus: Status): string {
  return statusMap[localStatus] || "BACKLOG";
}

// Map local Priority to API Priority
const priorityMap: Record<Priority, string> = {
  "Low": "LOW",
  "Medium": "MEDIUM",
  "High": "HIGH",
};

const priorityMapReverse: Record<string, Priority> = {
  "LOW": "Low",
  "MEDIUM": "Medium",
  "HIGH": "High",
};

interface ListTasksParams {
  workspaceId?: string;
  projectId?: string;
  status?: Status | "All";
  priority?: Priority | "All";
  search?: string;
  range?: [number, number];
  sort?: { field: string; order: "ASC" | "DESC" };
}

interface ApiTask {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  startDate?: string;
  estimateMinutes?: number;
  assigneeId?: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

function mapApiTaskToLocal(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    status: mapStatusToLocal(apiTask.status),
    priority: priorityMapReverse[apiTask.priority] || "Medium",
    dueDate: apiTask.dueDate,
    tags: [], // API doesn't have tags yet, keep empty for now
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

function mapLocalTaskToApi(task: TaskInput, workspaceId: string, projectId?: string): any {
  return {
    workspaceId,
    projectId,
    title: task.title,
    description: task.description,
    status: mapStatusToApi(task.status),
    priority: priorityMap[task.priority] || "MEDIUM",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
    // tags are not in API yet
  };
}

// LocalStorage implementation
class LocalStorageTasksRepo {
  async listTasks(params: ListTasksParams): Promise<{ data: Task[]; total: number }> {
    let tasks = loadTasks();

    // Apply filters
    if (params.status && params.status !== "All") {
      tasks = tasks.filter((t) => t.status === params.status);
    }
    if (params.priority && params.priority !== "All") {
      tasks = tasks.filter((t) => t.priority === params.priority);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (params.sort) {
      tasks.sort((a, b) => {
        const aVal = (a as any)[params.sort!.field];
        const bVal = (b as any)[params.sort!.field];
        if (params.sort!.order === "ASC") {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    const total = tasks.length;

    // Apply pagination
    if (params.range) {
      const [start, end] = params.range;
      tasks = tasks.slice(start, end + 1);
    }

    return { data: tasks, total };
  }

  async getTask(id: string): Promise<Task | null> {
    return getTaskById(id);
  }

  async createTask(data: TaskInput): Promise<Task> {
    return addTask(data);
  }

  async updateTask(id: string, patch: Partial<TaskInput>): Promise<Task | null> {
    return updateTask(id, patch);
  }

  async deleteTask(id: string): Promise<boolean> {
    return deleteTask(id);
  }
}

// API implementation
class ApiTasksRepo {
  private getWorkspaceId(): string {
    if (typeof window === "undefined") return "";
    const workspaceId = localStorage.getItem("task-tracker-workspace-id");
    if (!workspaceId) {
      throw new Error("Workspace ID not set. Please select a workspace.");
    }
    return workspaceId;
  }

  async listTasks(params: ListTasksParams): Promise<{ data: Task[]; total: number }> {
    const workspaceId = params.workspaceId || this.getWorkspaceId();

    // Build filter for API
    const filter: any = { workspaceId };
    if (params.projectId) filter.projectId = params.projectId;
    if (params.status && params.status !== "All") {
      filter.status = mapStatusToApi(params.status);
    }
    if (params.priority && params.priority !== "All") {
      filter.priority = priorityMap[params.priority];
    }
    if (params.search) {
      filter.q = params.search;
    }

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.set("filter", JSON.stringify(filter));

    if (params.sort) {
      queryParams.set("sort", JSON.stringify(params.sort));
    }

    if (params.range) {
      queryParams.set("range", JSON.stringify(params.range));
    }

    const response = await apiClient.get<ApiTask[]>(`/tasks?${queryParams.toString()}`);
    
    // Get total from Content-Range header (would need to expose it, for now estimate)
    const total = response.length || 0;

    return {
      data: response.map(mapApiTaskToLocal),
      total,
    };
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const apiTask = await apiClient.get<ApiTask>(`/tasks/${id}`);
      return mapApiTaskToLocal(apiTask);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createTask(data: TaskInput): Promise<Task> {
    const workspaceId = this.getWorkspaceId();
    const projectId = (data as any).projectId;

    const apiData = mapLocalTaskToApi(data, workspaceId, projectId);
    const apiTask = await apiClient.post<ApiTask>("/tasks", apiData);
    return mapApiTaskToLocal(apiTask);
  }

  async updateTask(id: string, patch: Partial<TaskInput>): Promise<Task | null> {
    const workspaceId = this.getWorkspaceId();
    const apiPatch: any = {};

    if (patch.title) apiPatch.title = patch.title;
    if (patch.description !== undefined) apiPatch.description = patch.description;
    if (patch.status) apiPatch.status = mapStatusToApi(patch.status);
    if (patch.priority) apiPatch.priority = priorityMap[patch.priority];
    if (patch.dueDate !== undefined) {
      apiPatch.dueDate = patch.dueDate ? new Date(patch.dueDate).toISOString() : null;
    }

    try {
      const apiTask = await apiClient.patch<ApiTask>(`/tasks/${id}`, apiPatch);
      return mapApiTaskToLocal(apiTask);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/tasks/${id}`);
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

export const tasksRepo = USE_API ? new ApiTasksRepo() : new LocalStorageTasksRepo();

