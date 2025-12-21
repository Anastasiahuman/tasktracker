"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import TaskForm from "@/components/TaskForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { tasksRepo } from "@/lib/tasksRepo";
import { Task, Status, Priority } from "@/types/task";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export default function TaskPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (USE_API) {
      if (!authLoading && !isAuthenticated) {
        router.push("/login");
        return;
      }

      if (isAuthenticated) {
        const workspaceId = localStorage.getItem("task-tracker-workspace-id");
        if (!workspaceId) {
          router.push("/workspace");
          return;
        }
      }
    }
  }, [USE_API, authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const id = params.id as string;
        const foundTask = await tasksRepo.getTask(id);
        setTask(foundTask);
      } catch (error: any) {
        console.error("Failed to load task:", error);
        showToast("Не удалось загрузить задачу", "error");
      } finally {
        setLoading(false);
      }
    };

    if (!USE_API || (USE_API && isAuthenticated && !authLoading)) {
      loadTask();
    }
  }, [params.id, USE_API, isAuthenticated, authLoading, showToast]);

  const handleSubmit = async (values: {
    title: string;
    description?: string;
    status: "Backlog" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    dueDate?: string;
    tags: string[];
  }) => {
    if (!task) return;

    try {
      const updated = await tasksRepo.updateTask(task.id, {
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
        tags: values.tags,
      });

      if (updated) {
        showToast("Задача обновлена", "success");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Failed to update task:", error);
      showToast("Не удалось обновить задачу", "error");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleDelete = () => {
    if (!task) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!task) return;
    try {
      const deleted = await tasksRepo.deleteTask(task.id);
      if (deleted) {
        showToast("Задача удалена", "success");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      showToast("Не удалось удалить задачу", "error");
    }
  };

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

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="sticker-card bg-white">
          <p className="text-center text-foreground/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <svg
              width="200"
              height="150"
              viewBox="0 0 200 150"
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
            >
              <path
                d="M50 80 Q30 60 50 50 Q60 30 80 40 Q100 20 120 40 Q130 30 140 50 Q160 50 150 70 Q170 80 160 100 Q140 110 120 100 Q100 120 80 110 Q60 120 50 100 Q30 100 40 80 Z"
                fill="rgba(184, 224, 240, 0.3)"
                stroke="rgba(126, 200, 227, 0.5)"
                strokeWidth="2"
              />
            </svg>
            <div className="relative z-10 mt-8">
              <Image
                src="/images/Ежик 1.png"
                alt="Ежик"
                width={120}
                height={120}
                className="rounded-full"
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Задача не найдена
          </h3>
          <p className="text-foreground/70 mb-6 text-center max-w-md">
            Задача с таким ID не существует или была удалена
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
          >
            Вернуться на Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="sticker-card bg-white mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-3">{task.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="btn-danger"
          >
            Удалить
          </button>
        </div>
        {task.description && (
          <p className="text-foreground/70 mb-4">{task.description}</p>
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

      <div className="sticker-card bg-white">
        <TaskForm
          mode="edit"
          initialValue={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Удалить задачу?"
        description="Это действие нельзя отменить. Задача будет удалена навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
