"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import { addTask } from "@/lib/storage";
import { useToast } from "@/components/ToastProvider";

export default function NewTaskPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = (values: {
    title: string;
    description?: string;
    status: "Backlog" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    dueDate?: string;
    tags: string[];
  }) => {
    addTask({
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      tags: values.tags,
    });

    showToast("Задача создана", "success");
    router.push("/");
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
