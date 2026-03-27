"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicePriceHistory,
  type ServiceFilters,
  type ServiceInsert,
  type ServiceUpdate,
} from "@/features/comercial/services/services-catalog";

export function useServices(filters?: ServiceFilters) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["services", tenantId, filters],
    queryFn: async () => {
      const supabase = createClient();
      return getServices(supabase, filters);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useService(id: string | null) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const supabase = createClient();
      return getServiceById(supabase, id!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const mutation = useMutation({
    mutationFn: async (input: Omit<ServiceInsert, "tenant_id">) => {
      const supabase = createClient();
      return createService(supabase, { ...input, tenant_id: tenantId! });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success(`Servico "${data.name}" criado`);

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "services",
        recordId: data.id,
        after: data as unknown as Record<string, unknown>,
      });
    },
    onError: (err, variables) => {
      toast.error(`Erro ao criar servico: ${err.message}`, {
        action: {
          label: "Tentar novamente",
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });
  return mutation;
}

export function useUpdateService() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceUpdate }) => {
      const supabase = createClient();
      return updateService(supabase, id, updates);
    },
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["service", variables.id] });
      toast.success(`Servico "${data.name}" atualizado`);

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "services",
        recordId: variables.id,
        after: variables.updates as unknown as Record<string, unknown>,
      });
    },
    onError: (err, variables) => {
      toast.error(`Erro ao atualizar servico: ${err.message}`, {
        action: {
          label: "Tentar novamente",
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });
  return mutation;
}

export function useDeleteService() {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      return deleteService(supabase, id);
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Servico removido");

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "services",
        recordId: id,
      });
    },
    onError: (err, variables) => {
      toast.error(`Erro ao remover servico: ${err.message}`, {
        action: {
          label: "Tentar novamente",
          onClick: () => mutation.mutate(variables),
        },
      });
    },
  });
  return mutation;
}

export function useServicePriceHistory(serviceId: string | null) {
  return useQuery({
    queryKey: ["service-price-history", serviceId],
    queryFn: async () => {
      const supabase = createClient();
      return getServicePriceHistory(supabase, serviceId!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!serviceId,
  });
}
