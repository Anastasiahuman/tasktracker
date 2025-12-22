"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Task, Status, Priority } from "@/types/task";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(2, "Название должно содержать минимум 2 символа"),
  description: z.string().max(2000, "Описание не должно превышать 2000 символов").optional().or(z.literal("")),
  status: z.enum(["Backlog", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(24)).max(10, "Максимум 10 тегов"),
  assigneeId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  mode: "create" | "edit";
  initialValue?: Task;
  onSubmit: (values: TaskFormData) => void;
  onCancel: () => void;
  members?: Array<{ id: string; name: string; email: string }>; // Список участников workspace
}

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

export default function TaskForm({ mode, initialValue, onSubmit, onCancel, members = [] }: TaskFormProps) {
  const [tagInput, setTagInput] = useState("");

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialValue
      ? {
          title: initialValue.title,
          description: initialValue.description || "",
          status: initialValue.status,
          priority: initialValue.priority,
          dueDate: formatDateForInput(initialValue.dueDate),
          tags: initialValue.tags || [],
          assigneeId: initialValue.assigneeId || "",
        }
      : {
          title: "",
          description: "",
          status: "Backlog",
          priority: "Medium",
          dueDate: "",
          tags: [],
          assigneeId: "",
    },
  });

  const tags = watch("tags");

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && trimmed.length <= 24 && tags.length < 10) {
      if (!tags.includes(trimmed)) {
        setValue("tags", [...tags, trimmed], { shouldValidate: true });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
          Название <span className="text-[var(--danger)]">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          className={`input-base ${
            errors.title ? "border-[var(--danger)]" : ""
          }`}
          placeholder="Введите название задачи"
        />
        {errors.title && (
          <p className="error-text">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
          Описание
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className={`textarea-base ${
            errors.description ? "border-[var(--danger)]" : ""
          }`}
          placeholder="Введите описание задачи (необязательно)"
        />
        {errors.description && (
          <p className="error-text">{errors.description.message}</p>
        )}
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">
            Статус
          </label>
          <select
            {...register("status")}
            className="select-base"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">
            Приоритет
          </label>
          <select
            {...register("priority")}
            className="select-base"
          >
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date and Assignee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text)] mb-2">
            Срок выполнения
          </label>
          <input
            {...register("dueDate")}
            type="date"
            className="input-base"
          />
          {errors.dueDate && (
            <p className="error-text">{errors.dueDate.message}</p>
          )}
        </div>

        {members.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Исполнитель
            </label>
            <select
              {...register("assigneeId")}
              className="select-base"
            >
              <option value="">Не назначен</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text)] mb-2">
          Теги (макс. 10)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Введите тег и нажмите Enter"
            maxLength={24}
            className="input-base flex-1"
            disabled={tags.length >= 10}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || tags.length >= 10 || tagInput.trim().length > 24}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add tag
          </button>
        </div>
        {errors.tags && (
          <p className="error-text">{errors.tags.message}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="chip bg-[var(--status-backlog)] text-[var(--status-backlog-text)]"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:opacity-70 transition-opacity"
                  aria-label={`Удалить тег ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          {mode === "create" ? "Создать задачу" : "Сохранить изменения"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
