"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";

/**
 * Sends a contract to Clicksign for signature.
 *
 * Flow:
 * 1. Creates envelope via API route (server-side Clicksign calls)
 * 2. Updates contract record with envelope ID + status
 * 3. Logs audit trail event
 */
export function useSendToClicksign() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      // Call a server action/API route that handles the Clicksign flow
      const response = await fetch("/api/contracts/send-to-clicksign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Erro ao enviar para Clicksign" }));
        throw new Error(err.error || "Erro ao enviar para Clicksign");
      }

      return response.json();
    },

    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract", contractId] });
      queryClient.invalidateQueries({
        queryKey: ["contracts", contractId, "timeline"],
      });

      toast.success("Contrato enviado para assinatura no Clicksign");

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "status_change",
        table: "contracts",
        recordId: contractId,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Cancels a Clicksign envelope for a contract.
 */
export function useCancelClicksignEnvelope() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      const response = await fetch("/api/contracts/cancel-clicksign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Erro ao cancelar" }));
        throw new Error(err.error || "Erro ao cancelar envelope");
      }

      return response.json();
    },

    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract", contractId] });

      toast.success("Envelope cancelado no Clicksign");

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "status_change",
        table: "contracts",
        recordId: contractId,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Resends notification to signers of a Clicksign envelope.
 */
export function useNotifyClicksignSigners() {
  return useMutation({
    mutationFn: async (contractId: string) => {
      const response = await fetch("/api/contracts/notify-clicksign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Erro ao notificar" }));
        throw new Error(err.error || "Erro ao notificar signatários");
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success("Notificação enviada aos signatários");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
