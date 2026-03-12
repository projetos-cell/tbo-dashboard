"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getContractSigners,
  createContractSigner,
  createContractSignersBatch,
  deleteContractSigner,
  type ContractSignerInsert,
} from "../services/contract-signers";

export function useContractSigners(contractId: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["contracts", contractId, "signers"],
    queryFn: () => getContractSigners(supabase, contractId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!contractId,
  });
}

export function useCreateContractSigner() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ContractSignerInsert) =>
      createContractSigner(supabase, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contract_id, "signers"],
      });
    },
  });
}

export function useCreateContractSignersBatch() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signers: ContractSignerInsert[]) =>
      createContractSignersBatch(supabase, signers),
    onSuccess: (_data, variables) => {
      if (variables.length) {
        queryClient.invalidateQueries({
          queryKey: ["contracts", variables[0].contract_id, "signers"],
        });
      }
    },
  });
}

export function useDeleteContractSigner() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; contractId: string }) =>
      deleteContractSigner(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contracts", variables.contractId, "signers"],
      });
    },
  });
}
