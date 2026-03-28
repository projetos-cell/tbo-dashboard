"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

import {
  getBIDashboards,
  getBIDashboard,
  createBIDashboard,
  updateBIDashboard,
  deleteBIDashboard,
  getBIWidgets,
  createBIWidget,
  updateBIWidget,
  deleteBIWidget,
  getWidgetData,
  type BIDashboard,
  type BIWidget,
  type CreateBIDashboardInput,
  type CreateBIWidgetInput,
} from "../services/bi-dashboards";

import {
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  toggleReportActive,
  type ScheduledReport,
  type CreateScheduledReportInput,
} from "../services/scheduled-reports";

import {
  getYoYMetrics,
  getYoYSummary,
  type YoYMetric,
  type YoYResult,
  type YoYSummary,
} from "../services/yoy-comparison";

import {
  getUnitEconomics,
  type UnitEconomics,
} from "../services/unit-economics";

import {
  getDataQualityScores,
  computeDataQuality,
  type DataQualityScore,
  type ModuleQualityResult,
} from "../services/data-quality";

const STALE_5MIN = 1000 * 60 * 5;

// ── BI Dashboards ─────────────────────────────────────────────────────────────

export function useBIDashboards() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<BIDashboard[]>({
    queryKey: ["bi-dashboards", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getBIDashboards(supabase);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

export function useBIDashboard(id: string | null) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<BIDashboard | null>({
    queryKey: ["bi-dashboard", tenantId, id],
    queryFn: async () => {
      if (!tenantId || !id) return null;
      const supabase = createClient();
      return getBIDashboard(supabase, id);
    },
    enabled: !!tenantId && !!id,
    staleTime: STALE_5MIN,
  });
}

export function useCreateBIDashboard() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<BIDashboard, Error, Omit<CreateBIDashboardInput, "tenant_id" | "created_by">>({
    mutationFn: async (input) => {
      if (!tenantId || !userId) throw new Error("Sessão inválida.");
      const supabase = createClient();
      return createBIDashboard(supabase, {
        ...input,
        tenant_id: tenantId,
        created_by: userId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bi-dashboards", tenantId] });
    },
  });
}

export function useUpdateBIDashboard() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<BIDashboard, Error, { id: string; updates: Parameters<typeof updateBIDashboard>[2] }>({
    mutationFn: async ({ id, updates }) => {
      const supabase = createClient();
      return updateBIDashboard(supabase, id, updates);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["bi-dashboards", tenantId] });
      qc.invalidateQueries({ queryKey: ["bi-dashboard", tenantId, id] });
    },
  });
}

export function useDeleteBIDashboard() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const supabase = createClient();
      return deleteBIDashboard(supabase, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bi-dashboards", tenantId] });
    },
  });
}

// ── BI Widgets ────────────────────────────────────────────────────────────────

export function useBIWidgets(dashboardId: string | null) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<BIWidget[]>({
    queryKey: ["bi-widgets", tenantId, dashboardId],
    queryFn: async () => {
      if (!tenantId || !dashboardId) return [];
      const supabase = createClient();
      return getBIWidgets(supabase, dashboardId);
    },
    enabled: !!tenantId && !!dashboardId,
    staleTime: STALE_5MIN,
  });
}

export function useCreateBIWidget() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<BIWidget, Error, CreateBIWidgetInput>({
    mutationFn: async (widget) => {
      const supabase = createClient();
      return createBIWidget(supabase, widget);
    },
    onSuccess: (_, widget) => {
      qc.invalidateQueries({ queryKey: ["bi-widgets", tenantId, widget.dashboard_id] });
    },
  });
}

export function useUpdateBIWidget() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<BIWidget, Error, { id: string; dashboardId: string; updates: Parameters<typeof updateBIWidget>[2] }>({
    mutationFn: async ({ id, updates }) => {
      const supabase = createClient();
      return updateBIWidget(supabase, id, updates);
    },
    onSuccess: (_, { dashboardId }) => {
      qc.invalidateQueries({ queryKey: ["bi-widgets", tenantId, dashboardId] });
    },
  });
}

export function useDeleteBIWidget() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<void, Error, { id: string; dashboardId: string }>({
    mutationFn: async ({ id }) => {
      const supabase = createClient();
      return deleteBIWidget(supabase, id);
    },
    onSuccess: (_, { dashboardId }) => {
      qc.invalidateQueries({ queryKey: ["bi-widgets", tenantId, dashboardId] });
    },
  });
}

export function useWidgetData(widget: Pick<BIWidget, "data_source" | "query_config" | "widget_type"> | null) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["widget-data", tenantId, widget?.data_source, widget?.query_config],
    queryFn: async () => {
      if (!tenantId || !widget) return null;
      const supabase = createClient();
      return getWidgetData(supabase, widget);
    },
    enabled: !!tenantId && !!widget,
    staleTime: STALE_5MIN,
  });
}

// ── Scheduled Reports ─────────────────────────────────────────────────────────

export function useScheduledReports() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<ScheduledReport[]>({
    queryKey: ["scheduled-reports", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getScheduledReports(supabase);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

export function useCreateScheduledReport() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<ScheduledReport, Error, Omit<CreateScheduledReportInput, "tenant_id" | "created_by">>({
    mutationFn: async (input) => {
      if (!tenantId || !userId) throw new Error("Sessão inválida.");
      const supabase = createClient();
      return createScheduledReport(supabase, {
        ...input,
        tenant_id: tenantId,
        created_by: userId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports", tenantId] });
    },
  });
}

export function useUpdateScheduledReport() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<ScheduledReport, Error, { id: string; updates: Parameters<typeof updateScheduledReport>[2] }>({
    mutationFn: async ({ id, updates }) => {
      const supabase = createClient();
      return updateScheduledReport(supabase, id, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports", tenantId] });
    },
  });
}

export function useDeleteScheduledReport() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const supabase = createClient();
      return deleteScheduledReport(supabase, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports", tenantId] });
    },
  });
}

export function useToggleReportActive() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<ScheduledReport, Error, { id: string; isActive: boolean }>({
    mutationFn: async ({ id, isActive }) => {
      const supabase = createClient();
      return toggleReportActive(supabase, id, isActive);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-reports", tenantId] });
    },
  });
}

// ── YoY Comparison ────────────────────────────────────────────────────────────

export function useYoYMetrics(metric: YoYMetric) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<YoYResult>({
    queryKey: ["yoy-metrics", tenantId, metric],
    queryFn: async () => {
      const supabase = createClient();
      return getYoYMetrics(supabase, metric);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

export function useYoYSummary() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<YoYSummary>({
    queryKey: ["yoy-summary", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getYoYSummary(supabase);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

// ── Unit Economics ────────────────────────────────────────────────────────────

export function useUnitEconomics() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<UnitEconomics>({
    queryKey: ["unit-economics", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getUnitEconomics(supabase);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

// ── Data Quality ──────────────────────────────────────────────────────────────

export function useDataQualityScores() {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<DataQualityScore[]>({
    queryKey: ["data-quality-scores", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getDataQualityScores(supabase);
    },
    enabled: !!tenantId,
    staleTime: STALE_5MIN,
  });
}

export function useRunDataQualityScan() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  return useMutation<ModuleQualityResult[], Error, void>({
    mutationFn: async () => {
      if (!tenantId) throw new Error("Tenant não identificado.");
      const supabase = createClient();
      return computeDataQuality(supabase, tenantId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["data-quality-scores", tenantId] });
    },
  });
}
