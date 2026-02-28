"use client";

import { useCallback, useRef } from "react";

export interface UndoAction {
  type: string;
  payload: Record<string, unknown>;
  inverse: Record<string, unknown>;
}

const MAX_HISTORY = 20;

/**
 * Generic undo stack for drag-and-drop operations.
 * Stores actions with their inverse so we can revert.
 */
export function useUndoStack() {
  const stackRef = useRef<UndoAction[]>([]);
  const isUndoingRef = useRef(false);

  const push = useCallback((action: UndoAction) => {
    // Don't record actions triggered by undo
    if (isUndoingRef.current) return;
    stackRef.current = [...stackRef.current.slice(-MAX_HISTORY + 1), action];
  }, []);

  const pop = useCallback((): UndoAction | null => {
    if (stackRef.current.length === 0) return null;
    const action = stackRef.current[stackRef.current.length - 1];
    stackRef.current = stackRef.current.slice(0, -1);
    return action ?? null;
  }, []);

  const setUndoing = useCallback((v: boolean) => {
    isUndoingRef.current = v;
  }, []);

  const size = useCallback(() => stackRef.current.length, []);

  const clear = useCallback(() => {
    stackRef.current = [];
  }, []);

  return { push, pop, setUndoing, size, clear };
}
