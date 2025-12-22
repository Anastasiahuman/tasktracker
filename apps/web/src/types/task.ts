export type Status = "Backlog" | "In Progress" | "Done";
export type Priority = "Low" | "Medium" | "High";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string; // ISO date string
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  assigneeId?: string;
  assignee?: User;
}

