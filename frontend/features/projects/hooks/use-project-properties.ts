"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPropertyOptions,
  createPropertyOption,
  updatePropertyOption,
  deletePropertyOption,
  reorderPropertyOptions,
  type PropertyType,
  type PropertyOption,
  type CreatePropertyOptionInput,
  type UpdatePropertyOptionInput,
} from "@/features/projects/services/project-properties";
import { PROJECT_STATUS, PROJECT_PRIORITY } from "@/lib/constants";

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// Build fallback from hardcoded constants when DB has no rows yet
function buildFallback(property: PropertyType): PropertyOption[] {
  const source = property === "status" ? PROJECT_STATUS : PROJECT_PRIORITY;
  const categoryMap: Record<string, string> = {
    em_andamento: "in_progress",
    em_revisao: "in_progress",
    concluido: "done",
  };

  return Object.entries(source).map(([key, cfg], idx) => ({
    id: `fallback-${key}`,
    tenant_id: "",
    property,
    key,
    label: cfg.label,
    color: cfg.color,
    bg: cfg.bg,
    category: (property === "status" ? (categoryMap[key] ?? "in_progress") : null) as PropertyOption["category"],
    sort_order: idx,
    created_at: "",
    updated_at: "",
  }));
}

export function usePropertyOptions(property: PropertyType) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["project-property-options", tenantId, property],
    queryFn: () => getPropertyOptions(tenantId!, property),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data.length > 0 ? data : buildFallback(property)),
  });
}

export function useCreatePropertyOption() {
  const tenantId = useTenantId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePropertyOptionInput) =>
      createPropertyOption(tenantId!, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["project-property-options", tenantId, variables.property],
      });
    },
  });
}

export function useUpdatePropertyOption(property: PropertyType) {
  const tenantId = useTenantId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePropertyOptionInput }) =>
      updatePropertyOption(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["project-property-options", tenantId, property],
      });
    },
  });
}

export function useDeletePropertyOption(property: PropertyType) {
  const tenantId = useTenantId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePropertyOption(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["project-property-options", tenantId, property],
      });
    },
  });
}

export function useReorderPropertyOptions(property: PropertyType) {
  const tenantId = useTenantId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderPropertyOptions(items),
    onMutate: async (items) => {
      const key = ["project-property-options", tenantId, property];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<PropertyOption[]>(key);
      if (prev) {
        const orderMap = new Map(items.map((i) => [i.id, i.sort_order]));
        const next = [...prev]
          .map((o) => ({
            ...o,
            sort_order: orderMap.get(o.id) ?? o.sort_order,
          }))
          .sort((a, b) => a.sort_order - b.sort_order);
        qc.setQueryData(key, next);
      }
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(
          ["project-property-options", tenantId, property],
          ctx.prev
        );
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["project-property-options", tenantId, property],
      });
    },
  });
}
