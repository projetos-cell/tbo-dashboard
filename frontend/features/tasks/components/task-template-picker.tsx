"use client";

import { useState } from "react";
import {
  IconTemplate,
  IconTrash,
  IconPlus,
  IconClock,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTaskTemplates, useDeleteTaskTemplate } from "@/features/tasks/hooks/use-task-templates";
import type { TaskTemplate } from "@/features/tasks/services/task-templates";

interface TaskTemplatePickerProps {
  onSelect: (template: TaskTemplate) => void;
}

export function TaskTemplatePicker({ onSelect }: TaskTemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const { data: templates, isLoading } = useTaskTemplates();
  const deleteTemplate = useDeleteTaskTemplate();

  const handleSelect = (template: TaskTemplate) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex h-7 items-center gap-1.5 rounded-md border border-border/60 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <IconTemplate className="size-3.5" />
              Template
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Criar tarefa a partir de um template
          </TooltipContent>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0" sideOffset={4}>
        <div className="border-b border-border/60 px-3 py-2">
          <p className="text-xs font-medium">Templates de Tarefa</p>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-1">
          {isLoading ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Carregando...
            </p>
          ) : !templates || templates.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <IconTemplate className="mx-auto mb-2 size-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                Nenhum template salvo
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                Salve uma tarefa como template pelo menu de contexto
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <button
                  type="button"
                  className="flex flex-1 flex-col gap-0.5 text-left"
                  onClick={() => handleSelect(template)}
                >
                  <span className="text-sm font-medium truncate">
                    {template.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {template.priority && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        {template.priority}
                      </Badge>
                    )}
                    {template.subtasks_json.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {template.subtasks_json.length} subtarefas
                      </span>
                    )}
                    {template.estimated_hours != null && template.estimated_hours > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <IconClock className="size-2.5" />
                        {template.estimated_hours}h
                      </span>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate.mutate(template.id);
                  }}
                  className="flex size-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                  title="Excluir template"
                >
                  <IconTrash className="size-3 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
