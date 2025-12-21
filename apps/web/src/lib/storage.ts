import { Task } from "@/types/task";
import { seedTasks } from "./seed";

const STORAGE_KEY = "task-tracker-tasks";

export function loadTasks(): Task[] {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      const seeded = seedTasks();
      saveTasks(seeded);
      return seeded;
    }

    const tasks = JSON.parse(stored) as Task[];
    return tasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
    // Fallback to seed data if parsing fails
    const seeded = seedTasks();
    try {
      saveTasks(seeded);
    } catch (saveError) {
      console.error("Error saving seed tasks:", saveError);
    }
    return seeded;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
    // Silently fail - user can still use the app
  }
}

export function getTaskById(id: string): Task | null {
  const tasks = loadTasks();
  return tasks.find((task) => task.id === id) || null;
}

export interface TaskInput {
  title: string;
  description?: string;
  status: Task["status"];
  priority: Task["priority"];
  dueDate?: string;
  tags: string[];
}

export function addTask(input: TaskInput): Task {
  // Use crypto.randomUUID if available (modern browsers), otherwise fallback
  let id: string;
  if (typeof window !== "undefined" && typeof crypto !== "undefined" && crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    // Fallback for older browsers or SSR
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  const now = new Date().toISOString();
  
  const newTask: Task = {
    id,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };

  const tasks = loadTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  
  return newTask;
}

export function updateTask(id: string, patch: Partial<TaskInput>): Task | null {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);
  
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  saveTasks(tasks);
  
  return updatedTask;
}

export function deleteTask(id: string): boolean {
  const tasks = loadTasks();
  const initialLength = tasks.length;
  const filteredTasks = tasks.filter((task) => task.id !== id);
  
  if (filteredTasks.length === initialLength) {
    return false; // Task not found
  }

  saveTasks(filteredTasks);
  return true;
}

