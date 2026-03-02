import type { ComponentType } from "react";
import dynamic from "next/dynamic";

// ── Widget component imports ────────────────────────────────────
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { TasksOverview } from "@/components/dashboard/tasks-overview";
import { PipelineOverview } from "@/components/dashboard/founder/pipeline-overview";
import { ActiveProjects } from "@/components/dashboard/founder/active-projects";
import { UrgentTasks } from "@/components/dashboard/founder/urgent-tasks";
import { OkrSnapshotCard } from "@/components/dashboard/founder/okr-snapshot";
import { AlertsPanel } from "@/components/dashboard/founder/alerts-panel";
import { QuickActions } from "@/components/dashboard/general/quick-actions";
import { AgendaSummary } from "@/components/dashboard/general/agenda-summary";

// Heavy component — lazy loaded (recharts)
const FinancialOverview = dynamic(
  () =>
    import("@/components/dashboard/founder/financial-overview").then((m) => ({
      default: m.FinancialOverview,
    })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);

// ── Types ───────────────────────────────────────────────────────

export interface WidgetDef {
  /** Unique stable id (used as D&D key and localStorage key) */
  id: string;
  /** Human-readable label shown in the widget header */
  label: string;
  /** React component to render */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  /**
   * Key inside the dashboard data object whose value is passed as the
   * widget's primary prop. When `null` the widget receives no props
   * (e.g. QuickActions, AgendaSummary).
   */
  propsKey: string | null;
  /** Name of the prop to pass the data as (e.g. "projects", "entries") */
  propName: string | null;
  /** Only visible on founder/admin dashboards */
  founderOnly: boolean;
  /** CSS grid column span (default 1) */
  colSpan?: 1 | 2;
}

// ── Founder widgets ─────────────────────────────────────────────

export const FOUNDER_WIDGETS: WidgetDef[] = [
  {
    id: "financial-overview",
    label: "Visão Financeira",
    component: FinancialOverview,
    propsKey: "financial",
    propName: "entries",
    founderOnly: true,
  },
  {
    id: "pipeline-overview",
    label: "Pipeline Comercial",
    component: PipelineOverview,
    propsKey: "deals",
    propName: "deals",
    founderOnly: true,
  },
  {
    id: "active-projects",
    label: "Projetos Ativos",
    component: ActiveProjects,
    propsKey: "projects",
    propName: "projects",
    founderOnly: true,
  },
  {
    id: "urgent-tasks",
    label: "Tarefas Urgentes",
    component: UrgentTasks,
    propsKey: "tasks",
    propName: "tasks",
    founderOnly: true,
  },
  {
    id: "okr-snapshot",
    label: "OKRs",
    component: OkrSnapshotCard,
    propsKey: "okrSnapshots",
    propName: "snapshots",
    founderOnly: true,
  },
  {
    id: "alerts-panel",
    label: "Alertas",
    component: AlertsPanel,
    propsKey: "alerts",
    propName: "alerts",
    founderOnly: true,
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
    founderOnly: false,
  },
  {
    id: "tasks-overview",
    label: "Tarefas",
    component: TasksOverview,
    propsKey: "tasks",
    propName: "tasks",
    founderOnly: false,
  },
  {
    id: "agenda-summary",
    label: "Agenda",
    component: AgendaSummary,
    propsKey: null,
    propName: null,
    founderOnly: false,
  },
  {
    id: "quick-actions",
    label: "Ações Rápidas",
    component: QuickActions,
    propsKey: null,
    propName: null,
    founderOnly: false,
  },
];

// ── Helpers ─────────────────────────────────────────────────────

/** Returns the default widget-id order for a given list of widgets. */
export function getDefaultOrder(widgets: WidgetDef[]): string[] {
  return widgets.map((w) => w.id);
}
