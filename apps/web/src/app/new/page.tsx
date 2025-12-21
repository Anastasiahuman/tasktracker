"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { tasksRepo } from "@/lib/tasksRepo";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

export default function NewTaskPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
        }
      }
    }
  }, [USE_API, authLoading, isAuthenticated, router]);

  const handleSubmit = async (values: {
    title: string;
    description?: string;
    status: "Backlog" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    dueDate?: string;
    tags: string[];
  }) => {
    try {
      await tasksRepo.createTask({
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || undefined,
        tags: values.tags,
      });

      showToast("Задача создана", "success");
      router.push("/");
    } catch (error: any) {
      console.error("Failed to create task:", error);
      showToast("Не удалось создать задачу", "error");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="sticker-card bg-white mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Создать новую задачу</h1>
        <p className="text-foreground/70">Заполните форму для создания новой задачи</p>
      </div>

      <div className="sticker-card bg-white">
        <TaskForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
