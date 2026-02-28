"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

type ToastInput = Omit<Toast, "id">;

let globalToasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  listeners.forEach((l) => l([...globalToasts]));
}

function addToast(t: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  globalToasts = [...globalToasts, { ...t, id }];
  notify();
  // Auto-dismiss after 3s
  setTimeout(() => {
    globalToasts = globalToasts.filter((x) => x.id !== id);
    notify();
  }, 3000);
}

export function dismissToast(id: string) {
  globalToasts = globalToasts.filter((x) => x.id !== id);
  notify();
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
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return toasts;
}
