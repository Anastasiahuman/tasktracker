"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { createTask, isAuthenticated } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function NewTaskPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (values: {
    title: string;
    description?: string;
    status: "Backlog" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    category?: string;
    dueDate?: string;
    tags: string[];
  }) => {
    try {
      setLoading(true);
      await createTask({
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
        category: values.category as any,
        dueDate: values.dueDate || undefined,
      });
      showToast("Задача создана", "success");
      router.push("/");
    } catch (error: any) {
      console.error("Error creating task:", error);
      showToast(error.message || "Ошибка создания задачи", "error");
    } finally {
      setLoading(false);
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
