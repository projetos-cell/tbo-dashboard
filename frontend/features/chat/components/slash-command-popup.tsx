"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  IconCheckbox,
  IconBell,
  IconChartBar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface SlashCommand {
  name: string;
  label: string;
  description: string;
  icon: typeof IconCheckbox;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: "/tarefa",
    label: "/tarefa",
    description: "Criar uma tarefa a partir desta mensagem",
    icon: IconCheckbox,
  },
  {
    name: "/lembrete",
    label: "/lembrete",
    description: "Definir um lembrete para você mesmo",
    icon: IconBell,
  },
  {
    name: "/poll",
    label: "/poll",
    description: "Criar uma enquete no canal",
    icon: IconChartBar,
  },
];

interface SlashCommandPopupProps {
  query: string;
  activeIndex: number;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  onChangeActive: (index: number) => void;
}

export function SlashCommandPopup({
  query,
  activeIndex,
  onSelect,
  onClose,
  onChangeActive,
}: SlashCommandPopupProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) => cmd.name.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q),
    );
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      className="absolute bottom-full left-0 mb-1 w-72 rounded-lg border bg-popover shadow-lg overflow-hidden z-50"
      role="listbox"
      aria-label="Comandos disponíveis"
    >
      <div className="px-3 py-1.5 border-b">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          Comandos
        </p>
      </div>
      <div ref={listRef} className="py-1 max-h-48 overflow-y-auto">
        {filtered.map((cmd, idx) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.name}
              type="button"
              role="option"
              aria-selected={idx === activeIndex}
              onMouseEnter={() => onChangeActive(idx)}
              onClick={() => onSelect(cmd)}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                idx === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              )}
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md shrink-0",
                idx === activeIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cmd.label}</p>
                <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="border-t px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span><kbd className="font-mono bg-muted px-1 rounded">↑↓</kbd> navegar</span>
        <span><kbd className="font-mono bg-muted px-1 rounded">Tab/Enter</kbd> selecionar</span>
        <span><kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> fechar</span>
      </div>
    </div>
  );
}
