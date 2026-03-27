"use client";

import { useEffect } from "react";

/**
 * Registers global keyboard shortcuts:
 * - Cmd+K / Ctrl+K → dispatches `tbo:open-search`
 * - Escape → dispatches `tbo:close-overlay`
 *
 * Ignores keystrokes when focus is inside input/textarea/contenteditable.
 */
export function useGlobalShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K — always capture even in inputs (standard search shortcut)
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("tbo:open-search"));
        return;
      }

      // Escape — always capture
      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("tbo:close-overlay"));
        return;
      }

      // For remaining shortcuts, ignore when user is typing
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      // No additional shortcuts here — page-level shortcuts are
      // handled by each page via their own useEffect listeners.
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
