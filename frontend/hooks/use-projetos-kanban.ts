"use client";

import { useMemo } from "react";
import { type UseQueryResult, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import type { KanbanTask, KanbanStatus, KanbanPriority } from "@/validations/kanban.schema";

// ---------------------------------------------------------------------------
// Query key
// ---------------------------------------------------------------------------

const QUERY_KEY = ["projetos-kanban"] as const;

// ---------------------------------------------------------------------------
// Mapeamento de status de projeto → KanbanStatus
// ---------------------------------------------------------------------------

export const PROJECT_KANBAN_STATUS_MAP: Record<string, KanbanStatus> = {
  backlog:      "backlog",
  em_andamento: "in-progress",
  producao:     "in-progress",
  em_revisao:   "todo",
  finalizado:   "done",
  parado:       "canceled",
  pausado:      "canceled",
};

// Mapeamento de prioridade de projeto → KanbanPriority
function mapPriority(priority: string | null): KanbanPriority {
  if (!priority) return "medium";
  const p = priority.toLowerCase();
  if (p === "alta" || p === "high") return "high";
  if (p === "baixa" || p === "low") return "low";
  return "medium";
}

// ---------------------------------------------------------------------------
// Tipo: row do projeto do Supabase
// ---------------------------------------------------------------------------

interface ProjectRow {
  id: string;
  name: string;
  status: string | null;
  priority: string | null;
  owner_name: string | null;
  client: string | null;
  client_company: string | null;
  tenant_id: string;
}

// ---------------------------------------------------------------------------
// Conversor: projeto → KanbanTask
// ---------------------------------------------------------------------------

function projectToKanbanTask(row: ProjectRow): KanbanTask {
  const rawStatus = row.status ?? "em_andamento";
  const kanbanStatus: KanbanStatus = PROJECT_KANBAN_STATUS_MAP[rawStatus] ?? "in-progress";

  return {
    id: row.id,
    title: row.name,
    status: kanbanStatus,
    label: row.client_company ?? row.client ?? undefined,
    priority: mapPriority(row.priority),
    assignee: row.owner_name ? { name: row.owner_name } : undefined,
  };
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

type MovePayload = { id: string; status: KanbanStatus };

type UseProjetosKanbanReturn = {
  query: UseQueryResult<KanbanTask[], Error>;
  tasksByStatus: Record<KanbanStatus, KanbanTask[]>;
  moveProjectMutation: ReturnType<typeof useMutation<void, Error, MovePayload, { previous: KanbanTask[] }>>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useProjetosKanban(): UseProjetosKanbanReturn {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // -------------------------------------------------------------------------
  // Query: busca projetos da tabela projects
  // -------------------------------------------------------------------------

  const query = useQuery<KanbanTask[], Error>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<KanbanTask[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, priority, owner_name, client, client_company, tenant_id")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return (data as ProjectRow[] ?? []).map(projectToKanbanTask);
    },
    staleTime: 1000 * 60 * 2,
  });

  // -------------------------------------------------------------------------
  // tasksByStatus: grupo por KanbanStatus para renderização por coluna
  // -------------------------------------------------------------------------

  const tasksByStatus = useMemo<Record<KanbanStatus, KanbanTask[]>>(() => {
    const base: Record<KanbanStatus, KanbanTask[]> = {
      backlog:      [],
      todo:         [],
      "in-progress": [],
      done:         [],
      canceled:     [],
    };
    if (!query.data) return base;
    for (const task of query.data) {
      base[task.status].push(task);
    }
    return base;
  }, [query.data]);

  // -------------------------------------------------------------------------
  // Move project: atualiza status no Supabase + optimistic update
  // Mapeia KanbanStatus de volta para o status original do projeto
  // -------------------------------------------------------------------------

  // Status padrão por KanbanStatus para persistência
  const KANBAN_TO_PROJECT_STATUS: Record<KanbanStatus, string> = {
    backlog:      "backlog",
    "in-progress": "em_andamento",
    todo:         "em_revisao",
    done:         "finalizado",
    canceled:     "parado",
  };

  const moveProjectMutation = useMutation<void, Error, MovePayload, { previous: KanbanTask[] }>({
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<KanbanTask[]>(QUERY_KEY) ?? [];

      queryClient.setQueryData<KanbanTask[]>(QUERY_KEY, (old = []) =>
        old.map((task) => (task.id === payload.id ? { ...task, status: payload.status } : task)),
      );

      return { previous };
    },

    mutationFn: async (payload: MovePayload): Promise<void> => {
      const projectStatus = KANBAN_TO_PROJECT_STATUS[payload.status];
      const { error } = await supabase
        .from("projects")
        .update({ status: projectStatus } as never)
        .eq("id", payload.id);

      if (error) throw new Error(error.message);
    },

    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<KanbanTask[]>(QUERY_KEY, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return { query, tasksByStatus, moveProjectMutation };
}
