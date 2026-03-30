"use client";

import { useGlobalHotkeys } from "@/hooks/use-global-hotkeys";

/**
 * Invisible client component that registers global keyboard shortcuts.
 * Mount once in the auth layout.
 */
export function GlobalHotkeysProvider() {
  useGlobalHotkeys();
  return null;
}
