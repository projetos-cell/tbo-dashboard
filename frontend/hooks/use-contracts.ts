"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
} from "@/services/contracts";

export function useContracts(filters?: {
  status?: string;
  search?: string;
  clientId?: string;
}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["contracts", tenantId, filters],
    queryFn: () => getContracts(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useContract(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContractById(supabase, id!, tenantId!),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Database["public"]["Tables"]["contracts"]["Insert"]) =>
      createContract(supabase, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateContract() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["contracts"]["Update"];
    }) => updateContract(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract"] });
    },
  });
}
