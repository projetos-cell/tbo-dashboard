"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useKanban } from "@/hooks/use-kanban";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { KanbanToolbar } from "@/components/kanban/KanbanToolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { KanbanStatus, KanbanTask } from "@/validations/kanban.schema";
import type { KanbanView } from "@/components/kanban/KanbanHeader";

// ---------------------------------------------------------------------------
// Column config — ordem e rótulos fixos das colunas
// ---------------------------------------------------------------------------

const COLUMN_CONFIG: { status: KanbanStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "todo", label: "A fazer" },
  { status: "in-progress", label: "Em andamento" },
  { status: "done", label: "Concluído" },
  { status: "canceled", label: "Cancelado" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KanbanPage() {
  const [view, setView] = useState<KanbanView>("board");
  const { query } = useKanban();
  const { data: tasks, isLoading, isError } = query;

  // Agrupamento por status — useMemo evita recalcular a cada render
  const tasksByStatus = useMemo<Record<KanbanStatus, KanbanTask[]>>(() => {
    const base: Record<KanbanStatus, KanbanTask[]> = {
      backlog: [],
      todo: [],
      "in-progress": [],
      done: [],
      canceled: [],
    };
    if (!tasks) return base;
    for (const task of tasks) {
      base[task.status].push(task);
    }
    return base;
  }, [tasks]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-start justify-between">
        <KanbanHeader view={view} onViewChange={setView} />

        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Toolbar — search, filters, avatar stack, actions */}
      <KanbanToolbar />

      {/* ------------------------------------------------------------------ */}
      {/* Estados: Loading / Error / Board                                     */}
      {/* ------------------------------------------------------------------ */}

      {isLoading ? (
        /* Skeleton content-aware — reflete o layout real das colunas */
        <div className="flex gap-4 overflow-hidden">
          {COLUMN_CONFIG.map(({ status }) => (
            <div key={status} className="bg-muted/50 flex h-[560px] w-80 flex-shrink-0 flex-col gap-3 rounded-lg p-3">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-destructive/30 bg-destructive/5 flex h-64 flex-col items-center justify-center gap-3 rounded-lg border text-center">
          <p className="text-destructive text-sm font-medium">Erro ao carregar as tarefas</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* Board — contêiner de scroll horizontal                              */
        /* flex-1 min-h-0 → ocupa altura restante sem vazar para fora         */
        /* overflow-x-auto → scroll horizontal nativo (mais confiável que     */
        /*   Radix ScrollArea para eixo horizontal em boards)                  */
        /* overflow-y-hidden → impede barra vertical duplicada                */
        /* ------------------------------------------------------------------ */
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          {/* flex-nowrap → colunas ficam lado a lado sem quebrar linha        */}
          {/* h-full → herda altura do contêiner pai (flex-1 acima)           */}
          {/* pb-4 → espaço abaixo para a scrollbar não sobrepor os cartões   */}
          <div className="flex h-full flex-nowrap gap-4 pb-4">
            {COLUMN_CONFIG.map(({ status, label }) => (
              <KanbanColumn key={status} title={label} count={tasksByStatus[status].length}>
                {tasksByStatus[status].map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </KanbanColumn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
