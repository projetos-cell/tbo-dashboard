"use client";

import { X } from "lucide-react";
import { useToastState, dismissToast } from "@/hooks/use-toast";

export function Toaster() {
  const toasts = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border p-3 shadow-lg animate-in slide-in-from-bottom-2 ${
            t.variant === "destructive"
              ? "border-destructive/50 bg-destructive text-destructive-foreground"
              : "border-border bg-background text-foreground"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
