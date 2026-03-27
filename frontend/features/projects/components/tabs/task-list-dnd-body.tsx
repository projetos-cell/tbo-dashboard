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
import type { TaskRow, ExtraColumn, TaskGroup } from "./task-list-helpers";
import type { CustomField } from "@/features/projects/services/custom-fields";
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
}

export function TaskListDndBody({
  sensors,
  processed,
  sections,
  parents,
  activeId,
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
}: TaskListDndBodyProps) {
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
        processed.map((group) => {
          const taskIds = group.items.map((t) => t.id);
          const sectionObj = (sections ?? []).find((s) => s.title === group.label);

          return (
            <div key={group.label || "all"}>
              {group.label && (
                <SectionHeader
                  label={group.label}
                  color={group.color}
                  count={group.items.length}
                  sectionId={sectionObj?.id}
                  isEditing={sectionEdit.editingSectionId === sectionObj?.id}
                  editValue={sectionEdit.editingSectionTitle}
                  onStartEdit={() => {
                    if (sectionObj) sectionEdit.onStartEdit(sectionObj.id, sectionObj.title);
                  }}
                  onEditChange={sectionEdit.onEditChange}
                  onEditConfirm={sectionEdit.onEditConfirm}
                  onEditCancel={sectionEdit.onEditCancel}
                  onDelete={sectionObj ? () => sectionEdit.onDeleteSection(sectionObj.id) : undefined}
                />
              )}
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
            </div>
          );
        })
      )}

      <DragOverlay>
        {activeId ? (
          <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-xl scale-[1.02] opacity-90">
            {parents.find((t) => t.id === activeId)?.title ?? ""}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
