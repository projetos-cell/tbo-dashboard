"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
    <TableRow className="bg-muted/30 hover:bg-muted/40 border-b">
      <TableCell colSpan={6} className="py-1.5 px-2">
        <div className="group flex items-center gap-2">
          <button
            onClick={onToggle}
            className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
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
              className="h-7 w-48 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <h3
              className="cursor-pointer text-sm font-semibold text-gray-700"
              onDoubleClick={() => {
                if (!section.is_default) {
                  setEditName(section.name);
                  setIsEditing(true);
                }
              }}
            >
              {section.name}
            </h3>
          )}

          <Badge variant="secondary" className="h-5 text-[10px]">
            {taskCount}
          </Badge>

          {!section.is_default && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditName(section.name);
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
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
