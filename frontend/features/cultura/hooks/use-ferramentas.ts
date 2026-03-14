"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  getFerramentasData,
  createTool,
  updateTool,
  deleteTool,
  type ToolInsert,
} from "@/features/cultura/services/ferramentas";

function useSupabase() {
  return createClient();
}

const FERRAMENTAS_KEY = ["ferramentas"] as const;

/** Returns tool categories and best practices.
 * Fetches from Supabase `tool_categories` table; falls back to static seed if unavailable. */
export function useFerramentas() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: FERRAMENTAS_KEY,
    queryFn: () => getFerramentasData(supabase),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateTool() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ToolInsert) => createTool(supabase, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FERRAMENTAS_KEY });
      toast.success("Ferramenta criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar ferramenta. Tente novamente.");
    },
  });
}

export function useUpdateTool() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ToolInsert> }) =>
      updateTool(supabase, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FERRAMENTAS_KEY });
      toast.success("Ferramenta atualizada!");
    },
    onError: () => {
      toast.error("Erro ao atualizar ferramenta. Tente novamente.");
    },
  });
}

export function useDeleteTool() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTool(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FERRAMENTAS_KEY });
      toast.success("Ferramenta excluída.");
    },
    onError: () => {
      toast.error("Erro ao excluir ferramenta. Tente novamente.");
    },
  });
}
