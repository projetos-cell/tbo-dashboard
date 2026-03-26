"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getWebsiteSettings,
  upsertWebsiteSettings,
} from "../services/website-settings";
import type { WebsiteSettingsUpdate } from "../types";
import { toast } from "sonner";

const QK = "website-settings";

export function useWebsiteSettings() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: [QK, tenantId],
    queryFn: () => getWebsiteSettings(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUpdateWebsiteSettings() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useMutation({
    mutationFn: (data: WebsiteSettingsUpdate) =>
      upsertWebsiteSettings(createClient(), tenantId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Configurações salvas");
    },
    onError: () => toast.error("Erro ao salvar configurações"),
  });
}
