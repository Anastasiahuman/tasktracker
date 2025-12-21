"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Task, Status, Priority } from "@/types/task";
import { loadTasks, updateTask, deleteTask } from "@/lib/storage";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import TaskCard from "@/components/TaskCard";
import TaskRow from "@/components/TaskRow";
import EmptyState from "@/components/EmptyState";
import Image from "next/image";

type ViewMode = "cards" | "compact";

const FILTERS_STORAGE_KEY = "task-tracker-filters";
const VIEW_STORAGE_KEY = "task-tracker-view";

interface Filters {
  search: string;
  status: Status | "All";
  priority: Priority | "All";
}

export default function Dashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback to default
        }
      }
    }
    return { search: "", status: "All", priority: "All" };
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "cards" || stored === "compact") {
        return stored;
      }
    }
    return "cards";
  });

  // Load tasks on mount
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  // Save view mode to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "All" && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "All" && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Count tasks by status
  const counts = useMemo(() => {
    return {
      backlog: tasks.filter((t) => t.status === "Backlog").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      done: tasks.filter((t) => t.status === "Done").length,
    };
  }, [tasks]);

  const handleUpdateTask = (taskId: string, status: Status) => {
    const updated = updateTask(taskId, { status });
    if (updated) {
      setTasks(loadTasks());
      showToast("Статус обновлен", "success");
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setDeleteConfirm({ id, title: task.title });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      if (deleteTask(deleteConfirm.id)) {
        setTasks(loadTasks());
        showToast("Задача удалена", "success");
      }
      setDeleteConfirm(null);
    }
  };

  const handleResetFilters = () => {
    setFilters({ search: "", status: "All", priority: "All" });
  };

  return (
    <div className="w-full">
      {/* Счетчики */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="sticker-card bg-pastel-purple flex items-center gap-3 px-6 py-4">
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center font-bold text-2xl text-purple-800">
            {counts.backlog}
          </div>
          <div>
            <div className="text-sm text-purple-700/70">В очереди</div>
            <div className="font-bold text-purple-800">Backlog</div>
          </div>
        </div>
        <div className="sticker-card bg-pastel-blue flex items-center gap-3 px-6 py-4">
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center font-bold text-2xl text-blue-800">
            {counts.inProgress}
          </div>
          <div>
            <div className="text-sm text-blue-700/70">В работе</div>
            <div className="font-bold text-blue-800">In Progress</div>
          </div>
        </div>
        <div className="sticker-card bg-pastel-green flex items-center gap-3 px-6 py-4">
          <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center font-bold text-2xl text-green-800">
            {counts.done}
          </div>
          <div>
            <div className="text-sm text-green-700/70">Готово</div>
            <div className="font-bold text-green-800">Done</div>
          </div>
        </div>
      </div>

      {/* Фильтры и управление */}
      <div className="sticker-card bg-white mb-6">
        <div className="flex flex-col gap-4">
          {/* Поиск */}
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию и описанию..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pastel-blue/30 focus:border-accent-blue focus:outline-none transition-colors"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 19L14.65 14.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Фильтры по статусу и приоритету */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-foreground/70 mb-2">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as Status | "All" })
                }
                className="w-full px-4 py-2 rounded-2xl border-2 border-pastel-blue/30 focus:border-accent-blue focus:outline-none transition-colors bg-white"
              >
                <option value="All">Все</option>
                <option value="Backlog">В очереди</option>
                <option value="In Progress">В работе</option>
                <option value="Done">Готово</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-foreground/70 mb-2">
                Приоритет
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value as Priority | "All" })
                }
                className="w-full px-4 py-2 rounded-2xl border-2 border-pastel-blue/30 focus:border-accent-blue focus:outline-none transition-colors bg-white"
              >
                <option value="All">Все</option>
                <option value="Low">Низкий</option>
                <option value="Medium">Средний</option>
                <option value="High">Высокий</option>
              </select>
            </div>
          </div>

          {/* Переключатель вида и кнопка New Task */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-pastel-blue/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  viewMode === "cards"
                    ? "bg-[var(--primary)] text-black"
                    : "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)]"
                }`}
              >
                Карточки
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  viewMode === "compact"
                    ? "bg-[var(--primary)] text-black"
                    : "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--border)]"
                }`}
              >
                Компактно
              </button>
            </div>

            <button
              onClick={() => router.push("/new")}
              className="btn-primary flex items-center gap-2"
            >
              <Image
                src="/images/Крош 2.png"
                alt="Крош"
                width={24}
                height={24}
                className="rounded-full"
              />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Список задач */}
      {filteredTasks.length === 0 ? (
        <EmptyState onResetFilters={handleResetFilters} />
      ) : (
        <div
          className={
            viewMode === "cards"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-3"
          }
        >
          {filteredTasks.map((task) =>
            viewMode === "cards" ? (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => handleUpdateTask(task.id, status)}
                onDelete={handleDeleteTask}
              />
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={(status) => handleUpdateTask(task.id, status)}
                onDelete={handleDeleteTask}
              />
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Удалить задачу?"
        description={deleteConfirm ? `Вы уверены, что хотите удалить задачу "${deleteConfirm.title}"? Это действие нельзя отменить.` : ""}
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
