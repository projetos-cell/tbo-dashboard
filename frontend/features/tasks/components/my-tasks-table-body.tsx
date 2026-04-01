"use client";

import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { MyTasksSectionRow } from "./my-tasks-section-row";
import { MyTaskTableRow } from "./my-task-table-row";
import { QuickAddTask } from "./quick-add-task";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { MyTaskWithSection, MyTasksSection } from "@/features/tasks/services/my-tasks";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import type { DynamicGroup } from "@/features/tasks/lib/my-tasks-utils";

// ─── Droppable section wrapper ──────────────────────────────

export function DroppableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <tbody
      ref={setNodeRef}
      className={isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}
    >
      {children}
    </tbody>
  );
}

// ─── Selection context ───────────────────────────────────────

interface SelectionCtx {
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}

// ─── Shared task row ─────────────────────────────────────────

interface TaskRowsProps {
  tasks: MyTaskWithSection[];
  columns: ResolvedColumn[];
  projectMap: Map<string, string>;
  onSelect: (task: MyTaskWithSection) => void;
  dndDisabled?: boolean;
  selection?: SelectionCtx;
}

function TaskRows({ tasks, columns, projectMap, onSelect, dndDisabled, selection }: TaskRowsProps) {
  return (
    <>
      {tasks.map((task) => (
        <MyTaskTableRow
          key={task.id}
          task={task}
          columns={columns}
          projectName={task.project_id ? projectMap.get(task.project_id) : undefined}
          onClick={() => onSelect(task)}
          dndDisabled={!!dndDisabled}
          isSelected={selection?.isSelected(task.id)}
          onToggle={selection ? () => selection.onToggle(task.id) : undefined}
        />
      ))}
    </>
  );
}

// ─── Section grouping ────────────────────────────────────────

interface SectionGroupingProps {
  sortedSections: MyTasksSection[];
  grouped: Map<string, MyTaskWithSection[]>;
  collapsedSections: Set<string>;
  columns: ResolvedColumn[];
  projectMap: Map<string, string>;
  onSelect: (task: MyTaskWithSection) => void;
  onToggleCollapse: (id: string) => void;
  onRenameSection: (id: string, name: string) => void;
  onDeleteSection: (id: string) => void;
  dndDisabled: boolean;
  selection?: SelectionCtx;
}

export function SectionGrouping({
  sortedSections,
  grouped,
  collapsedSections,
  columns,
  projectMap,
  onSelect,
  onToggleCollapse,
  onRenameSection,
  onDeleteSection,
  dndDisabled,
  selection,
}: SectionGroupingProps) {
  // +1 for the checkbox column
  const colSpan = columns.length + 1;

  return (
    <>
      {sortedSections.map((section) => {
        const sectionTasks = grouped.get(section.id) ?? [];
        const isCollapsed = collapsedSections.has(section.id);

        return (
          <DroppableSection key={section.id} id={section.id}>
            <MyTasksSectionRow
              section={section}
              taskCount={sectionTasks.length}
              isCollapsed={isCollapsed}
              onToggle={() => onToggleCollapse(section.id)}
              onRename={(name) => onRenameSection(section.id, name)}
              onDelete={() => onDeleteSection(section.id)}
            />

            {!isCollapsed && (
              <SortableContext
                id={section.id}
                items={sectionTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {sectionTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="py-3 text-center text-xs text-gray-400">
                      Nenhuma tarefa nesta seção
                    </TableCell>
                  </TableRow>
                )}
                <TaskRows
                  tasks={sectionTasks}
                  columns={columns}
                  projectMap={projectMap}
                  onSelect={onSelect}
                  dndDisabled={dndDisabled}
                  selection={selection}
                />
                <TableRow className="hover:bg-transparent border-0 border-t-0">
                  <TableCell colSpan={colSpan} className="py-0 px-0">
                    <QuickAddTask
                      sectionId={section.id}
                      sortOrder={
                        sectionTasks.length > 0
                          ? sectionTasks[sectionTasks.length - 1].my_sort_order + 1
                          : 0
                      }
                    />
                  </TableCell>
                </TableRow>
              </SortableContext>
            )}
          </DroppableSection>
        );
      })}

      {/* Unassigned tasks */}
      {grouped.has("__unassigned__") && (
        <TableBody>
          <TableRow className="hover:bg-transparent border-b-0 border-t border-border/30">
            <TableCell colSpan={colSpan} className="py-3 px-2 pt-5">
              <span className="text-sm font-bold text-foreground">
                Sem seção
                <span className="ml-1.5 text-muted-foreground/40 font-normal text-xs">({grouped.get("__unassigned__")!.length})</span>
              </span>
            </TableCell>
          </TableRow>
          <TaskRows
            tasks={grouped.get("__unassigned__")!}
            columns={columns}
            projectMap={projectMap}
            onSelect={onSelect}
            dndDisabled
            selection={selection}
          />
        </TableBody>
      )}
    </>
  );
}

// ─── Dynamic grouping ────────────────────────────────────────

interface DynamicGroupingProps {
  groups: DynamicGroup[];
  collapsedSections: Set<string>;
  columns: ResolvedColumn[];
  projectMap: Map<string, string>;
  onSelect: (task: MyTaskWithSection) => void;
  onToggleCollapse: (id: string) => void;
  selection?: SelectionCtx;
}

export function DynamicGrouping({
  groups,
  collapsedSections,
  columns,
  projectMap,
  onSelect,
  onToggleCollapse,
  selection,
}: DynamicGroupingProps) {
  const colSpan = columns.length + 1;

  return (
    <>
      {groups.map((group) => {
        const isCollapsed = collapsedSections.has(group.id);
        return (
          <TableBody key={group.id}>
            <TableRow
              className="hover:bg-transparent border-b-0 border-t border-border/30 cursor-pointer"
              onClick={() => onToggleCollapse(group.id)}
            >
              <TableCell colSpan={colSpan} className="py-3 px-2 pt-5">
                <span className="text-sm font-bold text-foreground">
                  {group.label}
                  <span className="ml-1.5 text-muted-foreground/40 font-normal text-xs">({group.tasks.length})</span>
                </span>
              </TableCell>
            </TableRow>
            {!isCollapsed && (
              <TaskRows
                tasks={group.tasks}
                columns={columns}
                projectMap={projectMap}
                onSelect={onSelect}
                dndDisabled
                selection={selection}
              />
            )}
          </TableBody>
        );
      })}
    </>
  );
}

// ─── Flat list (no grouping) ─────────────────────────────────

interface FlatListProps {
  tasks: MyTaskWithSection[];
  columns: ResolvedColumn[];
  projectMap: Map<string, string>;
  onSelect: (task: MyTaskWithSection) => void;
  selection?: SelectionCtx;
}

export function FlatList({ tasks, columns, projectMap, onSelect, selection }: FlatListProps) {
  const colSpan = columns.length + 1;

  return (
    <TableBody>
      {tasks.length === 0 && (
        <TableRow>
          <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-gray-400">
            Nenhuma tarefa encontrada
          </TableCell>
        </TableRow>
      )}
      <TaskRows tasks={tasks} columns={columns} projectMap={projectMap} onSelect={onSelect} dndDisabled selection={selection} />
    </TableBody>
  );
}
