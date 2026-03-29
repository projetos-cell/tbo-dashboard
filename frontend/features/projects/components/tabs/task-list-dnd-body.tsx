"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  type SensorDescriptor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableTaskRow } from "./task-list-sortable-row";
import { SectionHeader, type SectionHeaderProps } from "./task-list-section-header";
import { SortableSectionGroup } from "./task-list-sortable-section";
import type { TaskRow, ExtraColumn, TaskGroup } from "./task-list-helpers";
import type { CustomField } from "@/features/projects/services/custom-fields";
import { useMemo } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface SectionEditState {
  editingSectionId: string | null;
  editingSectionTitle: string;
  onStartEdit: (sectionId: string, title: string) => void;
  onEditChange: (value: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onDeleteSection: (sectionId: string) => void;
}

interface MultiSelectState {
  isSelected: (id: string) => boolean;
  handleClick: (id: string, e: ReactMouseEvent) => void;
  count: number;
  selectedIds: Set<string>;
  clearSelection: () => void;
}

interface TaskListDndBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<any>[];
  processed: TaskGroup[];
  sections?: { id: string; title: string; color: string | null }[];
  parents: TaskRow[];
  activeId: string | null;
  activeDragType: "task" | "section" | null;
  extraColumns: ExtraColumn[];
  columnWidths: Record<string, number>;
  customFields?: CustomField[];
  fieldValuesMap: Map<string, Map<string, unknown>>;
  subtasksMap: Map<string, TaskRow[]>;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onSelectTask: (taskId: string) => void;
  onFieldChange: (taskId: string, fieldId: string, value: unknown) => void;
  sectionEdit: SectionEditState;
  multiSelect: MultiSelectState;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
}

export function TaskListDndBody({
  sensors,
  processed,
  sections,
  parents,
  activeId,
  activeDragType,
  extraColumns,
  columnWidths,
  customFields,
  fieldValuesMap,
  subtasksMap,
  onDragStart,
  onDragEnd,
  onSelectTask,
  onFieldChange,
  sectionEdit,
  multiSelect,
  onMoveSectionUp,
  onMoveSectionDown,
}: TaskListDndBodyProps) {
  // Compute section sortable IDs for the outer SortableContext
  const sectionSortableIds = useMemo(() => {
    return processed
      .map((g) => {
        const sec = (sections ?? []).find((s) => s.title === g.label);
        return sec ? `section-${sec.id}` : null;
      })
      .filter((id): id is string => id !== null);
  }, [processed, sections]);

  // Compute section groups for isFirst/isLast
  const sectionGroups = useMemo(() => {
    return processed.filter((g) => {
      const s = (sections ?? []).find((sec) => sec.title === g.label);
      return !!s;
    });
  }, [processed, sections]);

  // Find active section group for DragOverlay
  const activeSectionGroup = useMemo(() => {
    if (!activeId || activeDragType !== "section") return null;
    const sectionId = activeId.replace("section-", "");
    const sec = (sections ?? []).find((s) => s.id === sectionId);
    if (!sec) return null;
    return processed.find((g) => g.label === sec.title) ?? null;
  }, [activeId, activeDragType, sections, processed]);

  const renderSectionContent = (group: TaskGroup) => {
    const taskIds = group.items.map((t) => t.id);
    return (
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {group.items.map((task) => (
          <SortableTaskRow
            key={task.id}
            task={task}
            subtasks={subtasksMap.get(task.id) ?? []}
            onSelect={onSelectTask}
            extraColumns={extraColumns}
            sections={sections}
            columnWidths={columnWidths}
            customFields={customFields}
            fieldValues={fieldValuesMap.get(task.id)}
            onFieldChange={onFieldChange}
            isSelected={multiSelect.isSelected(task.id)}
            onMultiSelectClick={(id, e) => multiSelect.handleClick(id, e)}
            selectedIds={multiSelect.count > 1 ? multiSelect.selectedIds : undefined}
            onClearSelection={multiSelect.clearSelection}
          />
        ))}
      </SortableContext>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {processed.every((g) => g.items.length === 0) ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma tarefa encontrada
        </p>
      ) : (
        <SortableContext items={sectionSortableIds} strategy={verticalListSortingStrategy}>
          {processed.map((group) => {
            const sectionObj = (sections ?? []).find((s) => s.title === group.label);
            const sectionIndex = sectionGroups.findIndex((g) => g.label === group.label);

            const sectionHeaderProps = {
              label: group.label,
              color: group.color,
              count: group.items.length,
              sectionId: sectionObj?.id,
              isEditing: sectionEdit.editingSectionId === sectionObj?.id,
              editValue: sectionEdit.editingSectionTitle,
              onStartEdit: () => {
                if (sectionObj) sectionEdit.onStartEdit(sectionObj.id, sectionObj.title);
              },
              onEditChange: sectionEdit.onEditChange,
              onEditConfirm: sectionEdit.onEditConfirm,
              onEditCancel: sectionEdit.onEditCancel,
              onDelete: sectionObj ? () => sectionEdit.onDeleteSection(sectionObj.id) : undefined,
              onMoveUp: sectionObj && onMoveSectionUp ? () => onMoveSectionUp(sectionObj.id) : undefined,
              onMoveDown: sectionObj && onMoveSectionDown ? () => onMoveSectionDown(sectionObj.id) : undefined,
              isFirst: sectionIndex === 0,
              isLast: sectionIndex === sectionGroups.length - 1,
            };

            // Groups with a section → sortable wrapper
            if (sectionObj && group.label) {
              return (
                <SortableSectionGroup
                  key={sectionObj.id}
                  sectionId={sectionObj.id}
                  renderHandle={(listeners, isDragging) => (
                    <SectionHeader
                      {...sectionHeaderProps}
                      dragHandleProps={listeners as React.HTMLAttributes<HTMLDivElement>}
                      isDragging={isDragging}
                    />
                  )}
                >
                  {renderSectionContent(group)}
                </SortableSectionGroup>
              );
            }

            // Groups without a section (e.g., "Sem seção") → plain div
            return (
              <div key={group.label || "all"}>
                {group.label && <SectionHeader {...sectionHeaderProps} />}
                {renderSectionContent(group)}
              </div>
            );
          })}
        </SortableContext>
      )}

      <DragOverlay>
        {activeId && activeDragType === "section" && activeSectionGroup ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-2.5 shadow-xl scale-[1.02] opacity-90">
            {activeSectionGroup.color && (
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeSectionGroup.color }}
              />
            )}
            <span className="text-xs font-semibold">{activeSectionGroup.label}</span>
            <span className="text-xs text-muted-foreground">
              ({activeSectionGroup.items.length} tarefas)
            </span>
          </div>
        ) : activeId && activeDragType === "task" ? (
          <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-xl scale-[1.02] opacity-90">
            {parents.find((t) => t.id === activeId)?.title ?? ""}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
