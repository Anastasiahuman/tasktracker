export type Status = "Backlog" | "In Progress" | "Done";
export type Priority = "Low" | "Medium" | "High";
export type Category = "DESIGN" | "REQUIREMENTS" | "RESEARCH" | "DEVELOPMENT" | "TESTING" | "PUBLICATION";

export const CategoryLabels: Record<Category, string> = {
  DESIGN: "Дизайн",
  REQUIREMENTS: "Формирование ТЗ",
  RESEARCH: "Исследования",
  DEVELOPMENT: "Разработка",
  TESTING: "Тестирование",
  PUBLICATION: "Публикация",
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: Category;
  dueDate?: string; // ISO date string
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
