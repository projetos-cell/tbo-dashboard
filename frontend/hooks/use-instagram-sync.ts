import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import {
  triggerInstagramSync,
  getInstagramConfig,
  saveInstagramConfig,
  getLastSyncRun,
  type InstagramConfig,
} from "@/services/instagram-sync";
import { toast } from "sonner";

/* ── Sync mutation ────────────────────────────────────────────────────────── */

export function useSyncInstagram() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (days?: number) => {
      if (!tenantId) throw new Error("No tenant");
      return triggerInstagramSync(tenantId, days);
    },
    onSuccess: () => {
      toast.success("Instagram sincronizado com sucesso");
      // Invalidate all RSM data
      queryClient.invalidateQueries({ queryKey: ["rsm-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["rsm-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["rsm-posts"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-sync-status"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao sincronizar: ${err.message}`);
    },
  });
}

/* ── Config queries ───────────────────────────────────────────────────────── */

export function useInstagramConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["instagram-config", tenantId],
    queryFn: () => {
      if (!tenantId) return null;
      return getInstagramConfig(tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveInstagramConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: InstagramConfig) => {
      if (!tenantId) throw new Error("No tenant");
      return saveInstagramConfig(tenantId, config);
    },
    onSuccess: () => {
      toast.success("Configuração do Instagram salva");
      queryClient.invalidateQueries({ queryKey: ["instagram-config"] });
    },
    onError: (err: Error) => {
      toast.error(`Erro ao salvar config: ${err.message}`);
    },
  });
}

/* ── Sync status ──────────────────────────────────────────────────────────── */

export function useInstagramSyncStatus() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["instagram-sync-status", tenantId],
    queryFn: () => {
      if (!tenantId) return null;
      return getLastSyncRun(tenantId);
    },
    enabled: !!tenantId,
    staleTime: 30 * 1000, // 30s — poll frequently during sync
  });
}
