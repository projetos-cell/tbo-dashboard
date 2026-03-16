"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  ensureProjectChannel,
  getProjectChannel,
} from "@/features/chat/services/chat-project-integration";
import { toast } from "sonner";

/** Returns the channel linked to a project (if any). */
export function useProjectChannel(projectId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["project-channel", projectId],
    queryFn: () => getProjectChannel(supabase, projectId!),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });
}

/** Creates a channel for a project if one doesn't exist yet. */
export function useEnsureProjectChannel() {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      projectName,
      memberIds,
    }: {
      projectId: string;
      projectName: string;
      memberIds?: string[];
    }) => {
      if (!userId || !tenantId) throw new Error("Not authenticated");
      return ensureProjectChannel(supabase, {
        projectId,
        projectName,
        tenantId,
        createdBy: userId,
        memberIds,
      });
    },
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ["project-channel", projectId] });
      qc.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal do projeto criado!", {
        description: "Acesse o Chat para ver o canal do projeto.",
      });
    },
    onError: () => {
      toast.error("Erro ao criar canal do projeto.");
    },
  });
}
