// API Client для работы с backend
import { Task, Status, Priority, Category } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Типы для API ответов
interface ApiTask {
  id: string;
  title: string;
  description?: string | null;
  status: string; // BACKLOG, IN_PROGRESS, DONE
  priority: string; // LOW, MEDIUM, HIGH
  category?: string | null; // DESIGN, REQUIREMENTS, etc.
  dueDate?: string | null;
  startDate?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; email: string; name?: string | null } | null;
  reporter?: { id: string; email: string; name?: string | null } | null;
  project?: { id: string; name: string; key: string } | null;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

// Преобразование статусов API в статусы фронтенда
function mapStatusFromApi(status: string): Status {
  const statusMap: Record<string, Status> = {
    BACKLOG: "Backlog",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };
  return statusMap[status as keyof typeof statusMap] || "Backlog";
}

function mapStatusToApi(status: Status): string {
  const statusMap: Record<Status, string> = {
    Backlog: "BACKLOG",
    "In Progress": "IN_PROGRESS",
    Done: "DONE",
  };
  return statusMap[status];
}

// Преобразование приоритетов API в приоритеты фронтенда
function mapPriorityFromApi(priority: string): Priority {
  const priorityMap: Record<string, Priority> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };
  return priorityMap[priority as keyof typeof priorityMap] || "Medium";
}

function mapPriorityToApi(priority: Priority): string {
  const priorityMap: Record<Priority, string> = {
    Low: "LOW",
    Medium: "MEDIUM",
    High: "HIGH",
  };
  return priorityMap[priority];
}

// Преобразование категорий
function mapCategoryFromApi(category: string | null | undefined): Category | undefined {
  if (!category) return undefined;
  const categoryMap: Record<string, Category> = {
    DESIGN: "DESIGN",
    REQUIREMENTS: "REQUIREMENTS",
    RESEARCH: "RESEARCH",
    DEVELOPMENT: "DEVELOPMENT",
    TESTING: "TESTING",
    PUBLICATION: "PUBLICATION",
  };
  return categoryMap[category] as Category;
}

function mapCategoryToApi(category: Category | undefined): string | undefined {
  return category;
}

// Преобразование задачи API в задачу фронтенда
function mapTaskFromApi(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || undefined,
    status: mapStatusFromApi(apiTask.status),
    priority: mapPriorityFromApi(apiTask.priority),
    category: mapCategoryFromApi(apiTask.category),
    dueDate: apiTask.dueDate || undefined,
    tags: [], // API не возвращает tags, возможно нужно добавить позже
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

// Получение токена авторизации
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

// Обновление токена при необходимости
async function refreshTokenIfNeeded(): Promise<void> {
  if (typeof window === "undefined") return;
  
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
    } else {
      // Токен истек, нужно перелогиниться
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  } catch (error) {
    console.error("Failed to refresh token:", error);
  }
}

// Базовый fetch с авторизацией
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Если 401, попробуем обновить токен
  if (response.status === 401) {
    await refreshTokenIfNeeded();
    const newToken = getAuthToken();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
        credentials: "include",
      });
    }
  }

  return response;
}

// Получение дефолтного workspace (первый доступный)
export async function getDefaultWorkspace(): Promise<string> {
  try {
    const response = await fetchWithAuth(`${API_URL}/workspaces`);
    if (!response.ok) {
      throw new Error("Failed to fetch workspaces");
    }
    const workspaces: Workspace[] = await response.json();
    if (workspaces.length === 0) {
      throw new Error("No workspaces found. Please create a workspace first.");
    }
    return workspaces[0].id;
  } catch (error) {
    console.error("Error getting default workspace:", error);
    throw error;
  }
}

// Получение всех задач
export async function getTasks(workspaceId?: string): Promise<Task[]> {
  try {
    const wsId = workspaceId || (await getDefaultWorkspace());
    const response = await fetchWithAuth(`${API_URL}/workspaces/${wsId}/tasks`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    const apiTasks: ApiTask[] = await response.json();
    return apiTasks.map(mapTaskFromApi);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

// Получение задачи по ID
export async function getTaskById(id: string, workspaceId?: string): Promise<Task | null> {
  try {
    const wsId = workspaceId || (await getDefaultWorkspace());
    const response = await fetchWithAuth(`${API_URL}/workspaces/${wsId}/tasks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch task");
    }
    const apiTask: ApiTask = await response.json();
    return mapTaskFromApi(apiTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

// Создание задачи
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
}

export async function createTask(
  input: CreateTaskInput,
  workspaceId?: string
): Promise<Task> {
  try {
    const wsId = workspaceId || (await getDefaultWorkspace());
    const response = await fetchWithAuth(`${API_URL}/workspaces/${wsId}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        status: input.status ? mapStatusToApi(input.status) : undefined,
        priority: input.priority ? mapPriorityToApi(input.priority) : undefined,
        category: input.category ? mapCategoryToApi(input.category) : undefined,
        dueDate: input.dueDate,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create task" }));
      throw new Error(error.message || "Failed to create task");
    }
    const apiTask: ApiTask = await response.json();
    return mapTaskFromApi(apiTask);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Обновление задачи
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
  workspaceId?: string
): Promise<Task> {
  try {
    const wsId = workspaceId || (await getDefaultWorkspace());
    const response = await fetchWithAuth(`${API_URL}/workspaces/${wsId}/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        status: input.status ? mapStatusToApi(input.status) : undefined,
        priority: input.priority ? mapPriorityToApi(input.priority) : undefined,
        category: input.category ? mapCategoryToApi(input.category) : undefined,
        dueDate: input.dueDate,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update task" }));
      throw new Error(error.message || "Failed to update task");
    }
    const apiTask: ApiTask = await response.json();
    return mapTaskFromApi(apiTask);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Удаление задачи
export async function deleteTask(
  id: string,
  workspaceId?: string
): Promise<void> {
  try {
    const wsId = workspaceId || (await getDefaultWorkspace());
    const response = await fetchWithAuth(`${API_URL}/workspaces/${wsId}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Проверка авторизации
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

// Выход
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

