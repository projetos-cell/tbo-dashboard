import type { ComponentType } from "react";
// ── Widget component imports ────────────────────────────────────
import { ProjectsOverview } from "@/features/dashboard/components/projects-overview";
import { TasksOverview } from "@/features/dashboard/components/tasks-overview";
import { PipelineOverview } from "@/features/dashboard/components/founder/pipeline-overview";
import { ActiveProjects } from "@/features/dashboard/components/founder/active-projects";
import { UrgentTasks } from "@/features/dashboard/components/founder/urgent-tasks";
import { OkrSnapshotCard } from "@/features/dashboard/components/founder/okr-snapshot";
import { AlertsPanel } from "@/features/dashboard/components/founder/alerts-panel";
import { QuickActions } from "@/features/dashboard/components/general/quick-actions";
import { AgendaSummary } from "@/features/dashboard/components/general/agenda-summary";

// ── Types ───────────────────────────────────────────────────────

export interface WidgetDef {
  /** Unique stable id (used as D&D key and localStorage key) */
  id: string;
  /** Human-readable label shown in the widget header */
  label: string;
  /** React component to render */
  component: ComponentType<Record<string, unknown>>;
  /**
   * Key inside the dashboard data object whose value is passed as the
   * widget's primary prop. When `null` the widget receives no props
   * (e.g. QuickActions, AgendaSummary).
   */
  propsKey: string | null;
  /** Name of the prop to pass the data as (e.g. "projects", "entries") */
  propName: string | null;
  /** Only visible on admin dashboards */
  adminOnly: boolean;
  /** CSS grid column span (default 1) */
  colSpan?: 1 | 2;
}

// ── Admin widgets ─────────────────────────────────────────────

export const ADMIN_WIDGETS: WidgetDef[] = [
  {
    id: "pipeline-overview",
    label: "Pipeline Comercial",
    component: PipelineOverview,
    propsKey: "deals",
    propName: "deals",
    adminOnly: true,
  },
  {
    id: "active-projects",
    label: "Projetos Ativos",
    component: ActiveProjects,
    propsKey: "projects",
    propName: "projects",
    adminOnly: true,
  },
  {
    id: "urgent-tasks",
    label: "Tarefas Urgentes",
    component: UrgentTasks,
    propsKey: "tasks",
    propName: "tasks",
    adminOnly: true,
  },
  {
    id: "okr-snapshot",
    label: "OKRs",
    component: OkrSnapshotCard,
    propsKey: "okrSnapshots",
    propName: "snapshots",
    adminOnly: true,
  },
  {
    id: "alerts-panel",
    label: "Alertas",
    component: AlertsPanel,
    propsKey: "alerts",
    propName: "alerts",
    adminOnly: true,
  },
];

// ── General widgets ─────────────────────────────────────────────

export const GENERAL_WIDGETS: WidgetDef[] = [
  {
    id: "projects-overview",
    label: "Projetos",
    component: ProjectsOverview,
    propsKey: "projects",
    propName: "projects",
    adminOnly: false,
  },
  {
    id: "tasks-overview",
    label: "Tarefas",
    component: TasksOverview,
    propsKey: "tasks",
    propName: "tasks",
    adminOnly: false,
  },
  {
    id: "agenda-summary",
    label: "Agenda",
    component: AgendaSummary,
    propsKey: null,
    propName: null,
    adminOnly: false,
  },
  {
    id: "quick-actions",
    label: "Ações Rápidas",
    component: QuickActions,
    propsKey: null,
    propName: null,
    adminOnly: false,
  },
];

// ── Helpers ─────────────────────────────────────────────────────

/** Returns the default widget-id order for a given list of widgets. */
export function getDefaultOrder(widgets: WidgetDef[]): string[] {
  return widgets.map((w) => w.id);
}
