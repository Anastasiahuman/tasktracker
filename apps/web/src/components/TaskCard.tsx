"use client";

import { Task, Status, Priority } from "@/types/task";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: Status) => void;
  onDelete: (id: string) => void;
}

const statusCycle: Status[] = ["Backlog", "In Progress", "Done"];

const statusColors: Record<Status, string> = {
  "Backlog": "bg-pastel-purple text-purple-800",
  "In Progress": "bg-pastel-blue text-blue-800",
  "Done": "bg-pastel-green text-green-800",
};

const priorityColors: Record<Priority, string> = {
  "Low": "bg-pastel-yellow text-yellow-800",
  "Medium": "bg-pastel-orange text-orange-800",
  "High": "bg-pastel-pink text-pink-800",
};

const statusLabels: Record<Status, string> = {
  "Backlog": "В очереди",
  "In Progress": "В работе",
  "Done": "Готово",
};

const priorityLabels: Record<Priority, string> = {
  "Low": "Низкий",
  "Medium": "Средний",
  "High": "Высокий",
};

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStatusChange = () => {
    setIsAnimating(true);
    const currentIndex = statusCycle.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];
    
    onStatusChange(newStatus);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleEdit = () => {
    router.push(`/task/${task.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <div
      className={`sticker-card bg-white hover:rotate-1 transition-all duration-300 ${
        isAnimating ? "scale-95 opacity-75" : "scale-100 opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-xl font-bold text-foreground flex-1 line-clamp-2">
          {task.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleStatusChange}
            className="p-2 rounded-xl bg-pastel-blue hover:bg-accent-blue transition-colors"
            title="Сменить статус"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3L13 8L8 13M3 8H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-xl bg-pastel-yellow hover:bg-accent-yellow transition-colors"
            title="Редактировать"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68566 11.9447 1.59189C12.1731 1.49812 12.4173 1.45166 12.6637 1.45534C12.9101 1.45902 13.1528 1.51275 13.3778 1.61306C13.6028 1.71337 13.8055 1.85809 13.9733 2.03868C14.1412 2.21927 14.2708 2.43188 14.3547 2.66358C14.4386 2.89528 14.475 3.1414 14.4616 3.38723C14.4482 3.63306 14.3852 3.8736 14.2764 4.09438C14.1676 4.31516 14.0154 4.51159 13.8287 4.67134L13.333 5.16668L10.833 2.66668L11.3287 2.17134C11.5154 2.01159 11.7163 1.88566 11.9447 1.79189C12.1731 1.69812 12.4173 1.65166 12.6637 1.65534C12.9101 1.65902 13.1528 1.71275 13.3778 1.81306C13.6028 1.91337 13.8055 2.05809 13.9733 2.23868C14.1412 2.41927 14.2708 2.63188 14.3547 2.86358C14.4386 3.09528 14.475 3.3414 14.4616 3.58723C14.4482 3.83306 14.3852 4.0736 14.2764 4.29438C14.1676 4.51516 14.0154 4.71159 13.8287 4.87134L11.333 2.00001Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.66667 3.33334L12.1667 5.83334M2 14L5.52867 13.1387C5.67067 13.1053 5.80067 13.0387 5.90667 12.9453L13.3333 5.51867C13.5087 5.34334 13.5087 5.06334 13.3333 4.88801L11.1113 2.66601C10.936 2.49067 10.656 2.49067 10.4807 2.66601L3.054 10.0927C2.96067 10.1987 2.894 10.3287 2.86067 10.4707L2 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-xl bg-pastel-pink hover:bg-accent-pink transition-colors"
            title="Удалить"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4H14M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.dueDate && (
        <div className={`mb-3 text-sm font-medium ${isOverdue ? "text-red-600" : "text-foreground/70"}`}>
          📅 {formatDate(task.dueDate)}
          {isOverdue && " (просрочено)"}
        </div>
      )}

      {task.assignee && (
        <div className="mb-3 flex items-center gap-2 text-sm text-foreground/70">
          <div className="w-6 h-6 rounded-full bg-pastel-blue flex items-center justify-center text-xs font-semibold text-blue-800">
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{task.assignee.name}</span>
        </div>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-lg text-xs bg-pastel-blue/50 text-foreground/80"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

