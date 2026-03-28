import { useRef, useEffect } from "react";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { GanttDataItem } from "./gantt-helpers";
import { expandGanttGrid, renderBaselineOverlay } from "./gantt-helpers";
import type { GanttOptions } from "./gantt-controls";

interface UseGanttRendererOptions {
  ganttData: GanttDataItem[];
  ganttDataKey: string;
  options: GanttOptions;
  baselineMapSize: number;
  onSelectTask: (taskId: string) => void;
  onError: (msg: string) => void;
}

/**
 * Handles frappe-gantt initialization, dynamic CSS injection,
 * and the container ref lifecycle.
 */
export function useGanttRenderer({
  ganttData,
  ganttDataKey,
  options,
  baselineMapSize,
  onSelectTask,
  onError,
}: UseGanttRendererOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<unknown>(null);
  const updateTask = useUpdateTask();

  // Stable refs for callbacks used inside async effect
  const onSelectRef = useRef(onSelectTask);
  onSelectRef.current = onSelectTask;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Load frappe-gantt base CSS
  useEffect(() => {
    const id = "frappe-gantt-css";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/frappe-gantt.css";
    document.head.appendChild(link);
  }, []);

  // Dynamic CSS for bar colors + compact + dark mode
  useEffect(() => {
    const styleId = "gantt-dynamic-styles";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    const colorRules = ganttData
      .map(
        (item) =>
          `.bar-wrapper.${item.custom_class} .bar-progress { fill: ${item._color} !important; }
           .bar-wrapper.${item.custom_class} .bar { fill: ${item._color} !important; opacity: 0.3; }`,
      )
      .join("\n");

    const compactRule = options.compact
      ? `.gantt .bar-wrapper .bar { height: 14px !important; } .gantt .bar-wrapper .bar-progress { height: 14px !important; }`
      : "";

    const darkModeOverride = `
html.dark {
  --g-arrow-color: #e5e5e5;
  --g-bar-color: #2a2a2a;
  --g-bar-border: #3a3a3a;
  --g-tick-color-thick: #1a1a1a;
  --g-tick-color: #0a0a0a;
  --g-actions-background: #1a1a1a;
  --g-border-color: #2a2a2a;
  --g-text-muted: #999999;
  --g-text-light: #ffffff;
  --g-text-dark: #f5f5f5;
  --g-progress-color: #4a4a4a;
  --g-handle-color: #d0d0d0;
  --g-weekend-label-color: #3a3a3a;
  --g-expected-progress: #5a5a5a;
  --g-header-background: #0a0a0a;
  --g-row-color: #141414;
  --g-row-border-color: #2a2a2a;
  --g-today-highlight: #999999;
  --g-popup-actions: #1a1a1a;
  --g-weekend-highlight-color: #0f0f0f;
}`;

    const layoutRules = `.gantt-wrapper .gantt-container { min-height: 600px; }
.gantt-wrapper .gantt-container svg.gantt { min-height: 600px; }
.gantt-wrapper .gantt-container .side-header { display: none !important; }
.bar-wrapper.gt-section-row { display: none !important; }`;

    style.textContent = `${darkModeOverride}\n${layoutRules}\n${colorRules}\n${compactRule}`;
  }, [ganttData, options.compact]);

  // Init / update frappe-gantt
  useEffect(() => {
    if (!containerRef.current || ganttData.length === 0) return;
    let mounted = true;

    async function initGantt() {
      try {
        const { default: Gantt } = await import("frappe-gantt");
        if (!mounted || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const items = ganttData.map(({ _color, ...rest }) => rest);

        const gantt = new Gantt(containerRef.current, items, {
          view_mode: options.viewMode,
          date_format: "YYYY-MM-DD",
          on_click: (task: { id: string }) => {
            onSelectRef.current(task.id);
          },
          on_date_change: (task: { id: string; _start: Date; _end: Date }) => {
            updateTask.mutate({
              id: task.id,
              updates: {
                start_date: task._start.toISOString().split("T")[0],
                due_date: task._end.toISOString().split("T")[0],
              },
            });
          },
          on_progress_change: (task: { id: string; progress: number }) => {
            updateTask.mutate({
              id: task.id,
              updates: {
                is_completed: task.progress >= 100,
                status: task.progress >= 100 ? "concluida" : "em_andamento",
              },
            });
          },
        });

        ganttRef.current = gantt;

        requestAnimationFrame(() => {
          if (!containerRef.current) return;
          expandGanttGrid(containerRef.current);

          if (options.showBaseline && baselineMapSize > 0) {
            renderBaselineOverlay(containerRef.current);
          }
        });
      } catch {
        if (mounted) onErrorRef.current("N\u00e3o foi poss\u00edvel carregar o Gantt.");
      }
    }

    initGantt();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttDataKey, options.viewMode, options.compact, options.showBaseline, baselineMapSize]);

  return { containerRef };
}
