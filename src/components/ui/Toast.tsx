"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface Toast {
  id: number;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface ToastContextType {
  toast: (type: Toast["type"], message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: Toast["type"], message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-body shadow-sm",
              "animate-in slide-in-from-right-5 fade-in duration-normal",
              {
                "bg-success/10 border-success/20 text-success":
                  t.type === "success",
                "bg-error/10 border-error/20 text-error": t.type === "error",
                "bg-warning/10 border-warning/20 text-warning":
                  t.type === "warning",
                "bg-accent/10 border-accent/20 text-accent": t.type === "info",
              }
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity duration-fast shrink-0 p-0.5 rounded-sm hover:bg-black/5"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
