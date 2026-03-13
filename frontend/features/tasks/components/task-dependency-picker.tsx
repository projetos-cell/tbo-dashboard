"use client";

import { useState, useCallback } from "react";
import {
  IconSearch,
  IconLoader2,
  IconWorld,
  IconFolder,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTasks } from "@/features/tasks/services/tasks";
import type { DependencyType } from "@/schemas/task-dependency";
import { TASK_STATUS } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────

interface TaskDependencyPickerProps {
  /** ID da tarefa atual — excluída da lista de resultados */
  currentTaskId: string;
  /** Escopo padrão: project_id ou null para buscar em todos os projetos */
  defaultProjectId?: string | null;
  onSelect: (targetTaskId: string, type: DependencyType) => void;
  children: React.ReactNode;
}

const DEPENDENCY_TYPE_LABELS: Record<DependencyType, string> = {
  finish_to_start: "Terminar → Iniciar (padrão)",
  start_to_start: "Iniciar → Iniciar",
  finish_to_finish: "Terminar → Terminar",
  start_to_finish: "Terminar ← Iniciar",
};

// ─── Component ─────────────────────────────────────────

export function TaskDependencyPicker({
  currentTaskId,
  defaultProjectId,
  onSelect,
  children,
}: TaskDependencyPickerProps) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [searchAll, setSearchAll] = useState(false);
  const [depType, setDepType] = useState<DependencyType>("finish_to_start");
  const [search, setSearch] = useState("");

  const filters = searchAll || !defaultProjectId
    ? {}
    : { project_id: defaultProjectId };

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["dependency-picker-tasks", filters, open],
    queryFn: () => getTasks(supabase, filters),
    enabled: open,
    staleTime: 1000 * 30,
  });

  const filtered = (tasks ?? []).filter(
    (t) =>
      t.id !== currentTaskId &&
      (search === "" || t.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = useCallback(
    (taskId: string) => {
      onSelect(taskId, depType);
      setOpen(false);
      setSearch("");
    },
    [onSelect, depType]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Dependency type selector */}
        <div className="p-2 border-b">
          <Select
            value={depType}
            onValueChange={(v) => setDepType(v as DependencyType)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEPENDENCY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar tarefa..."
            value={search}
            onValueChange={setSearch}
            className="text-xs"
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando...
              </div>
            ) : filtered.length === 0 ? (
              <CommandEmpty className="text-xs py-4">
                {search ? `Nenhuma tarefa com "${search}"` : "Nenhuma tarefa encontrada"}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((task) => {
                  const statusCfg =
                    TASK_STATUS[task.status as keyof typeof TASK_STATUS];
                  return (
                    <CommandItem
                      key={task.id}
                      value={task.id}
                      onSelect={() => handleSelect(task.id)}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="text-xs font-medium leading-snug line-clamp-1">
                        {task.title}
                      </span>
                      {statusCfg && (
                        <span
                          className="text-[10px] px-1.5 py-px rounded-full text-white"
                          style={{ backgroundColor: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {defaultProjectId && (
              <>
                <CommandSeparator />
                <div className="px-2 py-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] w-full justify-start gap-1.5"
                    onClick={() => setSearchAll((v) => !v)}
                  >
                    {searchAll ? (
                      <>
                        <IconFolder className="h-3.5 w-3.5" />
                        Buscar só neste projeto
                      </>
                    ) : (
                      <>
                        <IconWorld className="h-3.5 w-3.5" />
                        Buscar em todos os projetos
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CommandList>
        </Command>

        {/* Search icon hint */}
        {!isLoading && filtered.length === 0 && search === "" && (
          <div className="flex items-center justify-center py-3 text-xs text-muted-foreground gap-1.5 border-t">
            <IconSearch className="h-3 w-3" />
            Digite para buscar
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
