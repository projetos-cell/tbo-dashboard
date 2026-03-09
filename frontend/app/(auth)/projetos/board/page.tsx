"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useProjetosKanban } from "@/hooks/use-projetos-kanban";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { KanbanToolbar } from "@/components/kanban/KanbanToolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { KanbanStatus } from "@/validations/kanban.schema";
import type { KanbanView } from "@/components/kanban/KanbanHeader";

// ---------------------------------------------------------------------------
// Column config — reflete os status reais de projetos
// ---------------------------------------------------------------------------

const COLUMN_CONFIG: { status: KanbanStatus; label: string }[] = [
  { status: "backlog",      label: "Backlog" },
  { status: "todo",         label: "Em Revisão" },
  { status: "in-progress",  label: "Em Andamento" },
  { status: "done",         label: "Finalizado" },
  { status: "canceled",     label: "Parado" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjetosBoard() {
  const [view, setView] = useState<KanbanView>("board");
  const { query, tasksByStatus } = useProjetosKanban();
  const { isLoading, isError } = query;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <KanbanHeader title="Board de Projetos" view={view} onViewChange={setView} />

        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Toolbar */}
      <KanbanToolbar />

      {/* Board */}
      {isLoading ? (
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
          <p className="text-destructive text-sm font-medium">Erro ao carregar os projetos</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
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
