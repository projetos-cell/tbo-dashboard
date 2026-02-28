"use client";

import { useEffect } from "react";

/**
 * Listens for Ctrl+Z / Cmd+Z and triggers the undo callback.
 * Ignores keystrokes when focus is inside input/textarea/contenteditable.
 */
export function useUndoKeyboard(onUndo: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Only trigger on z key with ctrl/meta modifier, without shift (which is redo)
      if (e.key !== "z" || !(e.ctrlKey || e.metaKey) || e.shiftKey) return;

      // Don't intercept when user is typing
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      e.preventDefault();
      onUndo();
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUndo]);
}
