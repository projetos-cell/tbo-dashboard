import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import type { GanttColorBy } from "./gantt-controls";

export type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Constants ────────────────────────────────────────────

export const GANTT_ROW_H = 48;
export const GANTT_HEADER_H = 85;
export const MIN_GANTT_ROWS = 14;

export const SECTION_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#22c55e", "#06b6d4", "#ef4444", "#6366f1",
];

export const ASSIGNEE_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
  "#22c55e", "#06b6d4", "#ef4444", "#f97316",
];

// ─── Gantt data item type ─────────────────────────────────

export interface GanttDataItem {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class: string;
  _color: string;
}

// ─── Color helpers ────────────────────────────────────────

export function getBarColor(
  task: TaskRow,
  colorBy: GanttColorBy,
  sectionColorMap: Map<string, string>,
  assigneeColorMap: Map<string, string>
): string {
  switch (colorBy) {
    case "status": {
      const cfg = TASK_STATUS[task.status as TaskStatusKey];
      return cfg?.color ?? "#6b7280";
    }
    case "priority": {
      const cfg = TASK_PRIORITY[task.priority as TaskPriorityKey];
      return cfg?.color ?? "#6b7280";
    }
    case "section":
      return sectionColorMap.get(task.section_id ?? "") ?? "#6b7280";
    case "assignee":
      return assigneeColorMap.get(task.assignee_id ?? "") ?? "#6b7280";
    default:
      return "#6b7280";
  }
}

// ─── Build helpers ────────────────────────────────────────

export function taskCssClass(taskId: string): string {
  return `gt-${taskId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
}

export function buildGanttItem(
  task: TaskRow,
  depsMap: Map<string, string[]>,
  today: string,
  isSubtask: boolean,
  _color: string
): GanttDataItem {
  const predecessors = depsMap.get(task.id) ?? [];
  const name = isSubtask ? `  \u2514 ${task.title}` : task.title || "Sem t\u00edtulo";

  return {
    id: task.id,
    name,
    start: task.start_date || task.due_date || today,
    end: task.due_date || task.start_date || today,
    progress: task.is_completed ? 100 : 0,
    dependencies: predecessors.join(","),
    custom_class: taskCssClass(task.id),
    _color,
  };
}

// ─── Baseline overlay renderer ────────────────────────────

export function renderBaselineOverlay(container: HTMLElement): void {
  const svg = container.querySelector("svg.gantt");
  if (!svg) return;

  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.prepend(defs);
  }

  if (!defs.querySelector("#baseline-pattern")) {
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", "baseline-pattern");
    pattern.setAttribute("width", "6");
    pattern.setAttribute("height", "6");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("patternTransform", "rotate(45)");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "6");
    line.setAttribute("stroke", "#94a3b8");
    line.setAttribute("stroke-width", "1.5");
    pattern.appendChild(line);
    defs.appendChild(pattern);
  }

  const bars = svg.querySelectorAll(".bar-wrapper");
  bars.forEach((barEl) => {
    const barRect = barEl.querySelector(".bar");
    if (!barRect) return;

    const y = parseFloat(barRect.getAttribute("y") ?? "0");
    const height = parseFloat(barRect.getAttribute("height") ?? "20");

    const baselineRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    baselineRect.setAttribute("x", barRect.getAttribute("x") ?? "0");
    baselineRect.setAttribute("y", String(y + height + 2));
    baselineRect.setAttribute("width", barRect.getAttribute("width") ?? "0");
    baselineRect.setAttribute("height", "6");
    baselineRect.setAttribute("rx", "2");
    baselineRect.setAttribute("fill", "url(#baseline-pattern)");
    baselineRect.setAttribute("stroke", "#94a3b8");
    baselineRect.setAttribute("stroke-width", "0.5");
    baselineRect.setAttribute("opacity", "0.6");

    barEl.appendChild(baselineRect);
  });
}

// ─── Expand empty grid rows ───────────────────────────────

export function expandGanttGrid(container: HTMLElement): void {
  const gc = container.querySelector(".gantt-container") as HTMLElement | null;
  const svg = container.querySelector("svg.gantt") as SVGElement | null;
  if (!gc || !svg) return;

  const existingRows = svg.querySelectorAll(".grid-row");
  const neededRows = Math.max(0, MIN_GANTT_ROWS - existingRows.length);
  if (neededRows === 0) return;

  const lastRow = existingRows[existingRows.length - 1];
  const rowH = parseFloat(lastRow?.getAttribute("height") ?? "48");
  const rowW = lastRow?.getAttribute("width") ?? String(svg.getAttribute("width") ?? "1540");
  const lastY = parseFloat(lastRow?.getAttribute("y") ?? "85") + rowH;

  const rowsContainer = lastRow?.parentElement;
  const linesLayer = svg.querySelector(".lines_layer");

  for (let i = 0; i < neededRows; i++) {
    const y = lastY + i * rowH;
    if (rowsContainer) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", rowW);
      rect.setAttribute("height", String(rowH));
      rect.classList.add("grid-row");
      rowsContainer.appendChild(rect);
    }
    if (linesLayer) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", String(y + rowH));
      line.setAttribute("x2", rowW);
      line.setAttribute("y2", String(y + rowH));
      line.classList.add("row-line");
      linesLayer.appendChild(line);
    }
  }

  const newH = lastY + neededRows * rowH;
  svg.setAttribute("height", String(newH));
  svg.querySelectorAll(".tick").forEach((t) =>
    (t as SVGLineElement).setAttribute("y2", String(newH))
  );
  svg.querySelectorAll(".holiday-highlight").forEach((r) =>
    (r as SVGRectElement).setAttribute("height", String(newH - GANTT_HEADER_H))
  );
  const hl = gc.querySelector(".current-highlight") as HTMLElement | null;
  if (hl) hl.style.height = `${newH}px`;
}
