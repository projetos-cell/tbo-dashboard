"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  executeDealWonAutomation,
  type DealWonAutomationParams,
  type DealWonAutomationResult,
} from "@/features/comercial/services/deal-won-automation";
import type { Database } from "@/lib/supabase/types";

type DealRow = Database["public"]["Tables"]["crm_deals"]["Row"];

interface UseDealWonAutomationOptions {
  /** Called after successful automation with result */
  onSuccess?: (result: DealWonAutomationResult) => void;
}

/**
 * Hook to execute the deal-won automation pipeline.
 * Creates project + D3D flow + optional kickoff meeting from a deal.
 */
export function useDealWonAutomation(options?: UseDealWonAutomationOptions) {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (params: {
      deal: DealRow;
      kickoff?: DealWonAutomationParams["kickoff"];
    }) => {
      if (!tenantId) throw new Error("Tenant não encontrado");
      if (!userId) throw new Error("Usuário não autenticado");

      const supabase = createClient();
      return executeDealWonAutomation(supabase, {
        deal: params.deal,
        tenantId,
        userId,
        kickoff: params.kickoff,
      });
    },
    onSuccess: (result) => {
      // Invalidate related queries
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["d3d-flows"] });
      qc.invalidateQueries({ queryKey: ["meetings"] });

      const parts: string[] = [
        `Projeto ${result.project.code} criado`,
      ];
      if (result.d3dFlowCreated) parts.push("Pipeline D3D inicializado");
      if (result.meetingCreated) parts.push("Kickoff agendado");

      toast.success("Deal Won — Automação executada", {
        description: parts.join(" · "),
        duration: 6000,
      });

      options?.onSuccess?.(result);
    },
    onError: (err) => {
      toast.error("Erro na automação de deal ganho", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    },
  });
}
