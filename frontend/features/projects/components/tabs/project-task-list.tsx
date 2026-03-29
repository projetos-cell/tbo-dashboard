"use client";

import { IconListCheck, IconPlus } from "@tabler/icons-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SelectionMarquee } from "@/components/shared/selection-marquee";
import type { ProjectTaskListProps } from "./task-list-helpers";
import { TaskListTableHeader } from "./task-list-toolbar";
import { TaskListSkeleton } from "./task-list-skeleton";
import { TaskListBulkActions } from "./task-list-bulk-actions";
import { InlineNewTask, InlineNewSection } from "./task-list-inline-inputs";
import { TaskListDndBody } from "./task-list-dnd-body";
import { useTaskListState } from "./use-task-list-state";

export function ProjectTaskList({ projectId, onSelectTask, onAddTask }: ProjectTaskListProps) {
  const s = useTaskListState(projectId);

  if (s.isLoading) return <TaskListSkeleton />;

  return (
    <div className="space-y-4">
      <TaskListBulkActions
        count={s.multiSelect.count} totalCount={s.flatTaskIds.length}
        confirmOpen={s.confirmBulkDelete} onConfirmOpenChange={s.setConfirmBulkDelete}
        onBulkDelete={s.handleBulkDelete} onSelectAll={s.multiSelect.selectAll}
        onClearSelection={s.multiSelect.clearSelection}
      />

      {s.filtered.length === 0 && s.newTaskTitle === null ? (
        <EmptyState
          icon={IconListCheck}
          title={s.parents.length === 0 ? "Adicione a primeira tarefa do projeto" : "Nenhuma tarefa corresponde aos filtros"}
          description={s.parents.length === 0 ? "Divida o trabalho em tarefas, atribua responsáveis e defina prazos." : "Ajuste os filtros ou limpe a busca para ver suas tarefas."}
          cta={s.parents.length === 0 ? { label: "Criar Tarefa", onClick: s.handleAddTaskInline, icon: IconPlus } : undefined}
          compact
        />
      ) : (
        <div ref={s.marqueeContainerRef} className="relative overflow-x-auto rounded-lg border border-border/60">
          <SelectionMarquee containerRef={s.marqueeContainerRef} onSelect={s.handleMarqueeSelect} enabled={!s.activeId} />

          <TaskListTableHeader
            visibleColumns={s.visibleColumns} columnOrder={s.columnOrder} hiddenColumns={s.hiddenColumns}
            columnWidths={s.columnWidths} extraColumns={s.extraColumns} customFields={s.customFields}
            filters={s.filters} addMenuOpen={s.addMenuOpen} setAddMenuOpen={s.setAddMenuOpen}
            onHeaderClick={s.handleHeaderClick} onStartResize={s.handleStartResize}
            onToggleColumnVisibility={s.toggleColumnVisibility} onMoveColumnUp={s.moveColumnUp}
            onMoveColumnDown={s.moveColumnDown} onAddExtraColumn={s.addExtraColumn}
            onRemoveExtraColumn={s.removeExtraColumn} getColumnWidth={s.getColumnWidth}
          />

          <TaskListDndBody
            sensors={s.sensors} processed={s.processed} sections={s.sections ?? undefined}
            parents={s.parents} activeId={s.activeId} activeDragType={s.activeDragType}
            extraColumns={s.extraColumns}
            columnWidths={s.columnWidths} customFields={s.customFields}
            fieldValuesMap={s.fieldValuesMap} subtasksMap={s.subtasksMap}
            onDragStart={s.handleDragStart} onDragEnd={s.handleDragEnd}
            onSelectTask={onSelectTask} onFieldChange={s.handleFieldChange}
            sectionEdit={{
              editingSectionId: s.editingSectionId,
              editingSectionTitle: s.editingSectionTitle,
              onStartEdit: (id, title) => { s.setEditingSectionId(id); s.setEditingSectionTitle(title); },
              onEditChange: s.setEditingSectionTitle,
              onEditConfirm: s.handleRenameSectionConfirm,
              onEditCancel: () => { s.setEditingSectionId(null); s.setEditingSectionTitle(""); },
              onDeleteSection: s.handleDeleteSection,
            }}
            multiSelect={s.multiSelect}
            onMoveSectionUp={s.handleMoveSectionUp}
            onMoveSectionDown={s.handleMoveSectionDown}
          />

          {s.newTaskTitle !== null && (
            <InlineNewTask
              value={s.newTaskTitle} inputRef={s.newTaskRef} onChange={s.setNewTaskTitle}
              onConfirm={s.handleConfirmNewTask} onCancel={() => s.setNewTaskTitle(null)}
              onSmartTask={s.handleSmartTask} smartTaskLoading={s.smartTaskLoading}
              isPending={s.createTaskIsPending}
            />
          )}

          {s.newSectionTitle !== null && (
            <InlineNewSection
              value={s.newSectionTitle} inputRef={s.newSectionRef} onChange={s.setNewSectionTitle}
              onConfirm={s.handleConfirmNewSection} onCancel={() => s.setNewSectionTitle(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
