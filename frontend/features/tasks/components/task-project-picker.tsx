"use client";

import { useState } from "react";
import { IconCheck, IconFolder } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useAddTaskToProject } from "@/features/tasks/hooks/use-task-projects";

// ─── Constants ────────────────────────────────────────

const MAX_PROJECTS = 20;

// ─── Types ────────────────────────────────────────────

interface TaskProjectPickerProps {
  taskId: string;
  linkedProjectIds: string[];
  totalLinked: number;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────

export function TaskProjectPicker({
  taskId,
  linkedProjectIds,
  totalLinked,
  trigger,
  open: controlledOpen,
  onOpenChange: onControlledChange,
}: TaskProjectPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Support both controlled and uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function setOpen(value: boolean) {
    if (isControlled) {
      onControlledChange?.(value);
    } else {
      setInternalOpen(value);
    }
  }

  const { data: projects = [], isLoading } = useProjects();
  const addProject = useAddTaskToProject(taskId);

  const isAtLimit = totalLinked >= MAX_PROJECTS;

  // Filter out already-linked projects
  const availableProjects = projects.filter(
    (p) => !linkedProjectIds.includes(p.id)
  );

  function handleSelect(projectId: string) {
    setOpen(false);
    addProject.mutate(projectId);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start" sideOffset={4}>
        {isAtLimit ? (
          <div className="px-4 py-3 text-sm text-muted-foreground">
            Limite de {MAX_PROJECTS} projetos atingido.
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Buscar projeto..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Carregando..." : "Nenhum projeto encontrado"}
              </CommandEmpty>

              <CommandGroup heading="Projetos">
                {availableProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => handleSelect(project.id)}
                    className="flex items-center gap-2"
                  >
                    <IconFolder
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground"
                      )}
                    />
                    <span className="flex-1 truncate text-sm">
                      {project.name}
                    </span>
                    {linkedProjectIds.includes(project.id) && (
                      <IconCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
