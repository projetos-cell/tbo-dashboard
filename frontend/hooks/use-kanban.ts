"use client";

import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { kanbanTaskSchema } from "@/validations/kanban.schema";
import type { KanbanStatus, KanbanTask } from "@/validations/kanban.schema";

// ---------------------------------------------------------------------------
// Query key
// ---------------------------------------------------------------------------

const QUERY_KEY = ["kanban-tasks"] as const;

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

type MoveTaskPayload = { id: string; status: KanbanStatus };
type CreateTaskPayload = Omit<KanbanTask, "id">;

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

type UseKanbanReturn = {
  query: UseQueryResult<KanbanTask[], Error>;
  moveTaskMutation: UseMutationResult<void, Error, MoveTaskPayload, { previous: KanbanTask[] }>;
  createTaskMutation: UseMutationResult<KanbanTask, Error, CreateTaskPayload>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useKanban(): UseKanbanReturn {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // -------------------------------------------------------------------------
  // Step 6 — Query: busca tarefas do Supabase
  // -------------------------------------------------------------------------

  const query = useQuery<KanbanTask[], Error>({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<KanbanTask[]> => {
      const { data, error } = await supabase.from("kanban_tasks").select("*").order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      // Valida cada row com Zod para garantir tipagem segura
      return (data ?? []).map((row) => kanbanTaskSchema.parse(row));
    },
    staleTime: 1000 * 60 * 5,
  });

  // -------------------------------------------------------------------------
  // Steps 7 + 8 — Move task: Supabase update + optimistic update
  // -------------------------------------------------------------------------

  const moveTaskMutation = useMutation<void, Error, MoveTaskPayload, { previous: KanbanTask[] }>({
    // Step 8 — onMutate: optimistic cache update
    onMutate: async (payload) => {
      // Cancela refetches em andamento para evitar sobrescrever o estado otimista
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      // Captura snapshot anterior para rollback
      const previous = queryClient.getQueryData<KanbanTask[]>(QUERY_KEY) ?? [];

      // Atualiza cache imediatamente (optimistic)
      queryClient.setQueryData<KanbanTask[]>(QUERY_KEY, (old = []) =>
        old.map((task) => (task.id === payload.id ? { ...task, status: payload.status } : task)),
      );

      return { previous };
    },

    // Step 7 — mutationFn: persiste no Supabase
    mutationFn: async (payload: MoveTaskPayload): Promise<void> => {
      const { error } = await supabase.from("kanban_tasks").update({ status: payload.status }).eq("id", payload.id);

      if (error) throw new Error(error.message);
    },

    // Step 8 — onError: rollback do estado otimista
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData<KanbanTask[]>(QUERY_KEY, context.previous);
      }
    },

    // Step 7 — onSettled: revalida independente de erro ou sucesso
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // -------------------------------------------------------------------------
  // Step 9 — Create task: insert no Supabase
  // -------------------------------------------------------------------------

  const createTaskMutation = useMutation<KanbanTask, Error, CreateTaskPayload>({
    mutationFn: async (payload: CreateTaskPayload): Promise<KanbanTask> => {
      const { data, error } = await supabase
        .from("kanban_tasks")
        .insert(payload as never)
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      return kanbanTaskSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return { query, moveTaskMutation, createTaskMutation };
}
