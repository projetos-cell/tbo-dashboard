"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import type { MyTasksSection } from "@/features/tasks/services/my-tasks";

interface MyTasksSectionRowProps {
  section: MyTasksSection;
  taskCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function MyTasksSectionRow({
  section,
  taskCount,
  isCollapsed,
  onToggle,
  onRename,
  onDelete,
}: MyTasksSectionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const handleSubmitRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== section.name) {
      onRename(trimmed);
    }
    setIsEditing(false);
  }, [editName, section.name, onRename]);

  return (
    <TableRow className="hover:bg-transparent border-b-0 border-t border-border/30 first:border-t-0">
      <TableCell colSpan={6} className="py-3 px-2 pt-5">
        <div className="group flex items-center gap-2">
          <button
            onClick={onToggle}
            className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {isCollapsed ? (
              <IconChevronRight className="h-3.5 w-3.5" />
            ) : (
              <IconChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSubmitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitRename();
                if (e.key === "Escape") {
                  setEditName(section.name);
                  setIsEditing(false);
                }
              }}
              className="h-7 w-48 text-sm font-bold"
              autoFocus
            />
          ) : (
            <h3
              className="text-sm font-bold text-foreground cursor-default"
              onDoubleClick={() => {
                if (!section.is_default) {
                  setEditName(section.name);
                  setIsEditing(true);
                }
              }}
            >
              {section.name}
              <span className="ml-1.5 text-muted-foreground/40 font-normal text-xs">
                ({taskCount})
              </span>
            </h3>
          )}

          {!section.is_default && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <IconDots className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditName(section.name);
                    setIsEditing(true);
                  }}
                >
                  <IconPencil className="mr-2 h-3.5 w-3.5" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={onDelete}
                >
                  <IconTrash className="mr-2 h-3.5 w-3.5" />
                  Excluir seção
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
