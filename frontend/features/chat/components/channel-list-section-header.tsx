"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconFolderPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useChatStore } from "@/features/chat/stores/chat-store";

interface SectionHeaderProps {
  label: string;
  sectionId: string;
  count: number;
  isCustom?: boolean;
  onRenameSection?: (id: string, name: string) => void;
  onDeleteSection?: (id: string) => void;
}

export function SectionHeader({
  label,
  sectionId,
  count,
  isCustom,
  onRenameSection,
  onDeleteSection,
}: SectionHeaderProps) {
  const collapsed = useChatStore((s) => s.collapsedSections.has(sectionId));
  const toggleSection = useChatStore((s) => s.toggleSection);
  const renamingSectionId = useChatStore((s) => s.renamingSectionId);
  const setRenamingSectionId = useChatStore((s) => s.setRenamingSectionId);

  const [renameValue, setRenameValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRenaming = renamingSectionId === sectionId;

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(label);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isRenaming, label]);

  function handleRenameSubmit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== label) {
      onRenameSection?.(sectionId, trimmed);
    }
    setRenamingSectionId(null);
  }

  if (isRenaming && isCustom) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <Input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") setRenamingSectionId(null);
          }}
          className="h-6 text-[10px] font-semibold uppercase tracking-wider px-1"
        />
      </div>
    );
  }

  const headerButton = (
    <button
      type="button"
      onClick={() => toggleSection(sectionId)}
      className="flex w-full items-center gap-1 px-2 py-1 group cursor-pointer"
    >
      {collapsed ? (
        <IconChevronRight
          size={12}
          className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
        />
      ) : (
        <IconChevronDown
          size={12}
          className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
        />
      )}
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
        {label}
      </span>
      {count > 0 && collapsed && (
        <span className="text-[9px] text-muted-foreground ml-auto">{count}</span>
      )}
    </button>
  );

  if (!isCustom) return headerButton;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{headerButton}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => toggleSection(sectionId)}>
          {collapsed ? (
            <>
              <IconChevronDown size={14} className="mr-2" />
              Expandir seção
            </>
          ) : (
            <>
              <IconChevronRight size={14} className="mr-2" />
              Recolher seção
            </>
          )}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => setRenamingSectionId(sectionId)}>
          <IconPencil size={14} className="mr-2" />
          Renomear seção
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDeleteSection?.(sectionId)}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash size={14} className="mr-2" />
          Deletar seção
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface InlineCreateSectionProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function InlineCreateSection({ onSubmit, onCancel }: InlineCreateSectionProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
    onCancel();
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <IconFolderPlus size={12} className="shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Nome da seção..."
        className="h-6 text-[10px] font-semibold uppercase tracking-wider px-1"
      />
    </div>
  );
}
