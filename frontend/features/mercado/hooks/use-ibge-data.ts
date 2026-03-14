"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchPopulacaoPR,
  fetchMunicipiosPR,
  fetchProjecaoPR,
} from "@/features/mercado/services/ibge";

// ---------------------------------------------------------------------------
// População do PR por município (Censo 2022)
// ---------------------------------------------------------------------------

export function usePopulacaoPR() {
  return useQuery({
    queryKey: ["ibge", "populacao-pr"],
    queryFn: fetchPopulacaoPR,
    staleTime: 24 * 60 * 60 * 1000, // 24h — dados censitários não mudam frequentemente
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 dias de cache
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

// ---------------------------------------------------------------------------
// Lista de municípios do PR
// ---------------------------------------------------------------------------

export function useMunicipiosPR() {
  return useQuery({
    queryKey: ["ibge", "municipios-pr"],
    queryFn: fetchMunicipiosPR,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 dias — lista quase estática
    gcTime: 30 * 24 * 60 * 60 * 1000, // 30 dias de cache
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

// ---------------------------------------------------------------------------
// Projeção populacional do PR (tempo real)
// ---------------------------------------------------------------------------

export function useProjecaoPR() {
  return useQuery({
    queryKey: ["ibge", "projecao-pr"],
    queryFn: fetchProjecaoPR,
    staleTime: 60 * 60 * 1000, // 1h — projeção atualiza em tempo real
    gcTime: 24 * 60 * 60 * 1000, // 24h de cache
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}
