import { Task } from "@/types/task";

export function seedTasks(): Task[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  return [
    {
      id: "1",
      title: "Настроить проект",
      description: "Инициализировать Next.js проект, настроить Tailwind CSS и создать базовую структуру компонентов",
      status: "Done",
      priority: "High",
      dueDate: lastWeek.toISOString(),
      tags: ["разработка", "настройка", "важно"],
      createdAt: lastWeek.toISOString(),
      updatedAt: lastWeek.toISOString(),
    },
    {
      id: "2",
      title: "Создать Dashboard",
      description: "Реализовать главный экран с карточками задач, фильтрами и поиском",
      status: "In Progress",
      priority: "High",
      dueDate: tomorrow.toISOString(),
      tags: ["разработка", "UI", "функционал"],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: "3",
      title: "Добавить анимации",
      description: "Реализовать плавные переходы и hover-эффекты для карточек задач",
      status: "In Progress",
      priority: "Medium",
      tags: ["UI", "анимации", "UX"],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      title: "Оптимизировать производительность",
      description: "Провести аудит производительности и оптимизировать рендеринг компонентов",
      status: "Backlog",
      priority: "Medium",
      dueDate: nextWeek.toISOString(),
      tags: ["оптимизация", "производительность"],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      title: "Написать документацию",
      description: "Создать README с описанием проекта, инструкциями по установке и использованию",
      status: "Backlog",
      priority: "Low",
      tags: ["документация", "README"],
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "6",
      title: "Добавить тесты",
      description: "Написать unit-тесты для основных компонентов и утилит",
      status: "Backlog",
      priority: "Low",
      tags: ["тестирование", "качество"],
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "7",
      title: "Реализовать drag & drop",
      description: "Добавить возможность перетаскивания карточек для изменения статуса",
      status: "Backlog",
      priority: "Medium",
      dueDate: nextWeek.toISOString(),
      tags: ["функционал", "UX", "drag-drop"],
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "8",
      title: "Создать мобильную версию",
      description: "Адаптировать интерфейс для мобильных устройств с touch-жестами",
      status: "Backlog",
      priority: "High",
      tags: ["мобильная", "адаптивность", "UX"],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

