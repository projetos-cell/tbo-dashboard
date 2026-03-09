"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useDashboardStore } from "@/features/dashboard/stores/dashboard-store";
import type { WidgetDef } from "@/features/dashboard/utils/dashboard-widgets";
import { WidgetWrapper } from "./widget-wrapper";
import { WidgetToolbar } from "./widget-toolbar";

// ── Types ───────────────────────────────────────────────────────

interface WidgetGridProps {
  /** All available (non-pinned) widgets for this view */
  widgets: WidgetDef[];
  /** Dashboard data object — each widget picks its props via propsKey */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  /** Which dashboard view is active */
  view: "founder" | "general";
}

// ── Component ───────────────────────────────────────────────────

export function WidgetGrid({ widgets, data, view }: WidgetGridProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const store = useDashboardStore();

  const order = view === "founder" ? store.founderOrder : store.generalOrder;
  const hidden =
    view === "founder" ? store.founderHidden : store.generalHidden;

  // Visible widgets sorted by persisted order
  const visibleWidgets = useMemo(() => {
    const hiddenSet = new Set(hidden);
    const widgetMap = new Map(widgets.map((w) => [w.id, w]));

    // Follow persisted order, skip hidden, skip unknown IDs
    const sorted: WidgetDef[] = [];
    for (const id of order) {
      const w = widgetMap.get(id);
      if (w && !hiddenSet.has(id)) sorted.push(w);
    }

    // Append any widgets not yet in order (new widgets)
    for (const w of widgets) {
      if (!order.includes(w.id) && !hiddenSet.has(w.id)) sorted.push(w);
    }

    return sorted;
  }, [widgets, order, hidden]);

  const widgetIds = useMemo(
    () => visibleWidgets.map((w) => w.id),
    [visibleWidgets]
  );

  // ── Drag state ────────────────────────────────────────────────

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = widgetIds.indexOf(active.id as string);
      const newIndex = widgetIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove([...order],
        order.indexOf(active.id as string),
        order.indexOf(over.id as string)
      );
      store.reorder(view, newOrder);
    },
    [widgetIds, order, store, view]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // ── Render helpers ────────────────────────────────────────────

  const activeWidget = activeId
    ? visibleWidgets.find((w) => w.id === activeId)
    : null;

  function renderWidget(widget: WidgetDef) {
    const Component = widget.component;
    const props =
      widget.propsKey && widget.propName
        ? { [widget.propName]: data[widget.propsKey] }
        : {};

    return (
      <WidgetWrapper
        key={widget.id}
        id={widget.id}
        label={widget.label}
        colSpan={widget.colSpan}
        disableDrag={isMobile}
        onClose={() => store.hideWidget(view, widget.id)}
      >
        <Component {...props} />
      </WidgetWrapper>
    );
  }

  // ── Mobile: plain grid, no DnD ────────────────────────────────

  if (isMobile) {
    return (
      <>
        <WidgetToolbar view={view} widgets={widgets} />
        <div className="grid gap-6">{visibleWidgets.map(renderWidget)}</div>
      </>
    );
  }

  // ── Desktop: sortable grid ────────────────────────────────────

  return (
    <>
      <WidgetToolbar view={view} widgets={widgets} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className="grid gap-6 lg:grid-cols-2">
            {visibleWidgets.map(renderWidget)}
          </div>
        </SortableContext>

        {/* Drag overlay — smooth floating preview */}
        <DragOverlay dropAnimation={null}>
          {activeWidget ? (
            <div className="rotate-[1deg] scale-[1.02] opacity-90 shadow-xl rounded-xl border bg-white">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <h3 className="text-sm font-semibold">{activeWidget.label}</h3>
              </div>
              <div className="p-4 text-sm text-gray-500">
                Solte para reposicionar
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
