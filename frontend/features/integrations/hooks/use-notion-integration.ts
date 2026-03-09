"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NotionStatus {
  connected: boolean;
  workspace_name?: string;
  workspace_id?: string;
  owner_name?: string;
  connected_at?: string;
}

async function fetchStatus(): Promise<NotionStatus> {
  const res = await fetch("/api/notion/status");
  if (!res.ok) return { connected: false };
  return res.json();
}

export function useNotionStatus() {
  return useQuery<NotionStatus>({
    queryKey: ["notion-status"],
    queryFn: fetchStatus,
    staleTime: 30_000,
  });
}

export function useNotionDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notion/disconnect", { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao desconectar");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notion-status"] });
    },
  });
}
