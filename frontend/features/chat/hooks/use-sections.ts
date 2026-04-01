"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "@/features/chat/services/chat";

export function useSections() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["chat-sections", tenantId],
    queryFn: () => getSections(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateSection() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: { name: string; sortOrder?: number }) => {
      if (!tenantId || !userId) throw new Error("Usuário não autenticado");
      return createSection(supabase, {
        tenant_id: tenantId,
        name: input.name,
        sort_order: input.sortOrder ?? 0,
        created_by: userId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
      toast.success("Seção criada");
    },
    onError: (error) => {
      toast.error("Erro ao criar seção", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    },
  });
}

export function useUpdateSection() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; sort_order?: number };
    }) => updateSection(supabase, id, updates as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
    },
  });
}

export function useDeleteSection() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) => deleteSection(supabase, sectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat-sections"] });
      toast.success("Seção removida");
    },
  });
}
