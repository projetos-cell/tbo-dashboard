"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getContractEvents,
  createContractEvent,
  type ContractEventInsert,
} from "../services/contract-events";

export function useContractEvents(contractId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["contracts", contractId, "timeline"],
    queryFn: () => getContractEvents(supabase, contractId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!contractId,
  });
}

export function useCreateContractEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ContractEventInsert) =>
      createContractEvent(supabase, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contract_id, "timeline"],
      });
    },
  });
}
