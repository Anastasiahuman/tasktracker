"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // Max 3 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const typeColors = {
    success: "bg-pastel-green border-accent-green",
    error: "bg-pastel-pink border-accent-pink",
    info: "bg-pastel-blue border-accent-blue",
  };

  const typeIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`sticker-card ${typeColors[toast.type]} border-2 animate-slide-in min-w-[300px]`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center font-bold text-lg">
          {typeIcons[toast.type]}
        </div>
        <p className="flex-1 font-semibold text-foreground">{toast.message}</p>
        <button
          onClick={onRemove}
          className="text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
}
