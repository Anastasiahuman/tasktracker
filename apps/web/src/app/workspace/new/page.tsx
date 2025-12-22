"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

export default function NewWorkspacePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Введите название workspace", "error");
      return;
    }

    const token = getToken();
    if (!token) {
      showToast("Необходима авторизация", "error");
      router.push("/login");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(`${apiUrl}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const workspace = await response.json();
        showToast("Workspace создан!", "success");
        
        // Сохраняем выбранный workspace в localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedWorkspaceId", workspace.id);
        }
        
        router.push("/");
      } else {
        const error = await response.json();
        showToast(error.message || "Ошибка при создании workspace", "error");
      }
    } catch (error) {
      showToast("Ошибка при создании workspace", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div className="sticker-card bg-white">
        <div className="text-center mb-6">
          <div className="mb-4">
            <Image
              src="/images/Крош 1.png"
              alt="Крош"
              width={100}
              height={100}
              className="rounded-full mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Создать Workspace
          </h1>
          <p className="text-foreground/70">
            Workspace - это рабочее пространство для вашей команды и проектов
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Название Workspace <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder="Например: Команда разработки"
              required
              minLength={2}
              maxLength={100}
            />
            <p className="text-sm text-foreground/60 mt-2">
              Это название будет видно всем участникам workspace
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {creating ? "Создание..." : "Создать Workspace"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-secondary"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <div className="sticker-card bg-pastel-blue/30 mt-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Что такое Workspace?</h3>
            <p className="text-sm text-foreground/70">
              Workspace - это изолированное рабочее пространство, где вы можете:
            </p>
            <ul className="text-sm text-foreground/70 mt-2 space-y-1 list-disc list-inside">
              <li>Создавать проекты и задачи</li>
              <li>Приглашать участников команды</li>
              <li>Управлять правами доступа</li>
              <li>Организовывать работу команды</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


