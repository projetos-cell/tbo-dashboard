"use client";

import { useQuery } from "@tanstack/react-query";

export interface ClicksignHealthStatus {
  status: "connected" | "error" | "not_configured";
  environment: "production" | "sandbox" | "unknown";
  message: string;
  latencyMs?: number;
}

async function fetchClicksignHealth(): Promise<ClicksignHealthStatus> {
  const response = await fetch("/api/contracts/clicksign-health", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Falha ao verificar status do Clicksign");
  }

  return response.json();
}

/**
 * Checks Clicksign integration health.
 * Polls every 5 minutes. Stale after 2 minutes.
 */
export function useClicksignHealth() {
  return useQuery({
    queryKey: ["clicksign-health"],
    queryFn: fetchClicksignHealth,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
