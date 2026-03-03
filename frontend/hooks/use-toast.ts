"use client";

import { useState, useCallback, useEffect } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

type ToastInput = Omit<Toast, "id">;

// ── Window-event bus ─────────────────────────────────────────
// Next.js code-splitting can duplicate module-level state across
// chunks (layout vs. dynamic imports), so we use `window` custom
// events which are guaranteed to be a singleton.
//
// The dispatch is wrapped in setTimeout(0) so it escapes React 18's
// automatic batching — otherwise a toast triggered inside a mutation
// callback (e.g. React Query onSuccess) can be swallowed because
// React batches the Toaster's setState with the caller's state update.

const TOAST_ADD = "tbo:toast:add";
const TOAST_DISMISS = "tbo:toast:dismiss";

function addToast(t: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  // Dispatch async to escape React's automatic batching context
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent(TOAST_ADD, { detail: { ...t, id } })
    );
  }, 0);
  // Auto-dismiss after 5s
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent(TOAST_DISMISS, { detail: { id } })
    );
  }, 5_000);
}

export function dismissToast(id: string) {
  window.dispatchEvent(
    new CustomEvent(TOAST_DISMISS, { detail: { id } })
  );
}

/**
 * Minimal toast hook — no external dependency.
 */
export function useToast() {
  const toast = useCallback((input: ToastInput) => addToast(input), []);
  return { toast };
}

/**
 * Hook to subscribe to toast state (used by Toaster component).
 */
export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handleAdd(e: Event) {
      const toast = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, toast]);
    }
    function handleDismiss(e: Event) {
      const { id } = (e as CustomEvent).detail as { id: string };
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    window.addEventListener(TOAST_ADD, handleAdd);
    window.addEventListener(TOAST_DISMISS, handleDismiss);
    return () => {
      window.removeEventListener(TOAST_ADD, handleAdd);
      window.removeEventListener(TOAST_DISMISS, handleDismiss);
    };
  }, []);

  return toasts;
}
