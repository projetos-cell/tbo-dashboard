"use client";

import { useMemo, useState } from "react";
import {
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { format, startOfWeek, addWeeks, isWithinInterval, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useTeamMembers } from "@/hooks/use-team";
import { cn } from "@/lib/utils";
import { RequireRole } from "@/features/auth/components/require-role";

const WEEKS_TO_SHOW = 8;

function getWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  return `${format(weekStart, "dd/MM", { locale: ptBR })} – ${format(end, "dd/MM", { locale: ptBR })}`;
}

function getHeatColor(hours: number): string {
  if (hours === 0) return "bg-muted/30";
  if (hours <= 4) return "bg-blue-100 text-blue-700";
  if (hours <= 8) return "bg-blue-200 text-blue-800";
  if (hours <= 16) return "bg-blue-300 text-blue-900";
  if (hours <= 24) return "bg-amber-200 text-amber-800";
  return "bg-red-200 text-red-800";
}

export default function WorkloadPage() {
  const { data: tasks } = useTasks();
  const { data: members } = useTeamMembers({ is_active: true });
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ memberId: string; weekIdx: number } | null>(null);

  const baseWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const offsetStart = addWeeks(baseWeekStart, weekOffset);

  const weeks = useMemo(() => {
    return Array.from({ length: WEEKS_TO_SHOW }, (_, i) => {
      const start = addWeeks(offsetStart, i);
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return { start, end, label: getWeekLabel(start) };
    });
  }, [offsetStart]);

  // Build heatmap data: member -> week -> hours & tasks
  const heatmap = useMemo(() => {
    if (!tasks || !members) return new Map<string, Map<number, { hours: number; taskTitles: string[] }>>();

    const map = new Map<string, Map<number, { hours: number; taskTitles: string[] }>>();

    for (const member of members) {
      const weekMap = new Map<number, { hours: number; taskTitles: string[] }>();
      for (let i = 0; i < WEEKS_TO_SHOW; i++) {
        weekMap.set(i, { hours: 0, taskTitles: [] });
      }
      map.set(member.id, weekMap);
    }

    for (const task of tasks) {
      if (!task.assignee_id || !task.due_date) continue;
      const dueDate = new Date(task.due_date);
      const hours = ((task as Record<string, unknown>).estimated_hours as number) ?? 0;

      for (let i = 0; i < WEEKS_TO_SHOW; i++) {
        if (isWithinInterval(dueDate, { start: weeks[i].start, end: weeks[i].end })) {
          const memberMap = map.get(task.assignee_id);
          if (memberMap) {
            const cell = memberMap.get(i);
            if (cell) {
              cell.hours += hours;
              cell.taskTitles.push(task.title ?? "Sem título");
            }
          }
          break;
        }
      }
    }

    return map;
  }, [tasks, members, weeks]);

  const selectedTasks = useMemo(() => {
    if (!selectedCell || !tasks) return [];
    return tasks.filter((t) => {
      if (t.assignee_id !== selectedCell.memberId || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const week = weeks[selectedCell.weekIdx];
      return isWithinInterval(dueDate, { start: week.start, end: week.end });
    });
  }, [selectedCell, tasks, weeks]);

  return (
    <RequireRole module="projetos">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Workload por Colaborador</h1>
          <p className="text-sm text-muted-foreground">
            Horas estimadas distribuídas por semana
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset((o) => o - WEEKS_TO_SHOW)}
            className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="rounded-md px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((o) => o + WEEKS_TO_SHOW)}
            className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
          >
            <IconChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Heatmap grid */}
      {!members || members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconUsers className="mb-3 size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum membro encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/40">
                <th className="w-[180px] border-b border-r border-border/60 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Membro
                </th>
                {weeks.map((week, i) => (
                  <th
                    key={i}
                    className="min-w-[100px] border-b border-r border-border/60 px-2 py-2 text-center text-[10px] font-medium text-muted-foreground last:border-r-0"
                  >
                    {week.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const weekMap = heatmap.get(member.id);
                return (
                  <tr key={member.id} className="hover:bg-muted/10">
                    <td className="border-b border-r border-border/60 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                          {member.full_name
                            .split(" ")
                            .map((w: string) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="truncate text-sm">{member.full_name}</span>
                      </div>
                    </td>
                    {Array.from({ length: WEEKS_TO_SHOW }, (_, i) => {
                      const cell = weekMap?.get(i) ?? { hours: 0, taskTitles: [] };
                      const isSelected =
                        selectedCell?.memberId === member.id && selectedCell?.weekIdx === i;

                      return (
                        <td
                          key={i}
                          className="border-b border-r border-border/60 p-1 last:border-r-0"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCell(
                                    isSelected ? null : { memberId: member.id, weekIdx: i },
                                  )
                                }
                                className={cn(
                                  "flex h-10 w-full items-center justify-center rounded-md text-xs font-medium transition-all",
                                  getHeatColor(cell.hours),
                                  isSelected && "ring-2 ring-primary ring-offset-1",
                                  cell.hours === 0 && "text-muted-foreground/40",
                                )}
                              >
                                {cell.hours > 0 ? `${cell.hours}h` : "—"}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px] text-xs">
                              <p className="font-medium">
                                {member.full_name} — {weeks[i].label}
                              </p>
                              {cell.hours > 0 ? (
                                <>
                                  <p>{cell.hours}h estimadas</p>
                                  <p className="text-muted-foreground">
                                    {cell.taskTitles.length} tarefa(s)
                                  </p>
                                </>
                              ) : (
                                <p className="text-muted-foreground">Sem tarefas</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected cell detail */}
      {selectedCell && selectedTasks.length > 0 && (
        <div className="rounded-lg border border-border/60 p-4">
          <h3 className="mb-3 text-sm font-medium">
            Tarefas — {members?.find((m) => m.id === selectedCell.memberId)?.full_name} — {weeks[selectedCell.weekIdx].label}
          </h3>
          <div className="space-y-1">
            {selectedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/30"
              >
                <span className="truncate">{task.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {((task as Record<string, unknown>).estimated_hours as number | null) != null && (
                    <span className="text-xs text-muted-foreground">
                      {(task as Record<string, unknown>).estimated_hours as number}h
                    </span>
                  )}
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </RequireRole>
  );
}
