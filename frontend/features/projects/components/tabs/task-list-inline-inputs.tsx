"use client";

import type { RefObject } from "react";
import { IconPlus, IconLoader, IconSparkles } from "@tabler/icons-react";

// ─── Inline new task input ──────────────────────────────────────────────────

interface InlineNewTaskProps {
  value: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onSmartTask: () => void;
  smartTaskLoading: boolean;
  isPending: boolean;
}

export function InlineNewTask({
  value,
  inputRef,
  onChange,
  onConfirm,
  onCancel,
  onSmartTask,
  smartTaskLoading,
  isPending,
}: InlineNewTaskProps) {
  return (
    <div className="border-b border-border/30 px-3 py-2">
      <div className="flex items-center gap-0">
        <div className="w-[28px]" />
        <div className="w-[40px] flex items-center justify-center px-1">
          <IconPlus className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 px-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !smartTaskLoading) onConfirm();
              if (e.key === "Escape") onCancel();
            }}
            onBlur={() => {
              if (!smartTaskLoading) onConfirm();
            }}
            placeholder="Nome da tarefa... (Enter para criar, Esc para cancelar)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isPending || smartTaskLoading}
          />
        </div>
      </div>
      {(value.trim().length ?? 0) > 50 && (
        <div className="flex items-center gap-1.5 pl-[68px] pt-1.5">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onSmartTask}
            disabled={smartTaskLoading}
          >
            {smartTaskLoading ? (
              <IconLoader className="size-3 animate-spin" />
            ) : (
              <IconSparkles className="size-3" />
            )}
            {smartTaskLoading ? "Detalhando..." : "Detalhar com IA"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Inline new section input ───────────────────────────────────────────────

interface InlineNewSectionProps {
  value: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InlineNewSection({
  value,
  inputRef,
  onChange,
  onConfirm,
  onCancel,
}: InlineNewSectionProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2">
      <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onConfirm}
        placeholder="Nome da seção..."
        className="flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
