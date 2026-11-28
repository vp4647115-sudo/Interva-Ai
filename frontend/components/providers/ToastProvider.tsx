"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
type ToastMessage = { id: number; message: string; tone: ToastTone };
type ToastContextValue = { showToast: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, tone }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(
        () => setToasts((items) => items.filter((item) => item.id !== toast.id)),
        5000,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts]);

  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`flex items-start justify-between gap-3 rounded-xl border bg-surface px-4 py-3 text-sm shadow-card ${
              toast.tone === "error"
                ? "border-error text-error"
                : toast.tone === "success"
                  ? "border-success text-ink-primary"
                  : "border-border text-ink-primary"
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
              aria-label="Dismiss notification"
              className="shrink-0 text-ink-muted hover:text-ink-primary"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
