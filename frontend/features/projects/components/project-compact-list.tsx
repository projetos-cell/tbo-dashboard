"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { IconArrowUp, IconArrowDown, IconArrowsSort } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared";
import { IconFolderOpen } from "@tabler/icons-react";
import {
  useUpdateProject,
  useDeleteProject,
  useCreateProject,
} from "@/features/projects/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Project, SortField } from "./compact-list-helpers";
import { sortProjects, groupProjects } from "./compact-list-helpers";
import { ColumnHeaderMenu, type ExtraColumn } from "./compact-list-columns";
import { GridRow } from "./compact-list-row";
import { AddPropertyPopover } from "./compact-list-add-property";
import {
  useColumnResize,
  useExtraColumns,
  useColumnVisibility,
  useSortAndGroup,
  useConstrutoras,
} from "./compact-list-hooks";

interface ProjectCompactListProps {
  projects: Project[];
}

export function ProjectCompactList({ projects }: ProjectCompactListProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  const { columnWidths, getColumnWidth, handleStartResize } = useColumnResize();
  const {
    extraColumns, addMenuOpen, setAddMenuOpen,
    propertySearch, setPropertySearch,
    addSuggestedColumn, addTypeColumn, removeColumn, duplicateColumn,
  } = useExtraColumns();
  const { wrappedColumns, visibleColumns, toggleHideColumn, toggleWrapColumn } = useColumnVisibility();
  const {
    sortField, sortDir, toolbarState,
    handleSortFromMenu, handleGroupFromMenu, handleFilterFromMenu,
  } = useSortAndGroup();
  const construtoras = useConstrutoras(projects);

  const handleUpdate = useCallback(
    (id: string, updates: Record<string, unknown>) => {
      updateProject.mutate({ id, updates } as never);
    },
    [updateProject],
  );

  const handleDuplicate = useCallback((project: Project) => {
    createProject.mutate(
      {
        tenant_id: project.tenant_id, name: `${project.name} (copia)`,
        status: project.status, client: project.client,
        client_company: project.client_company, client_id: project.client_id,
        owner_name: project.owner_name, owner_id: project.owner_id,
        priority: project.priority, due_date_start: project.due_date_start,
        due_date_end: project.due_date_end, bus: project.bus,
        services: project.services, notes: project.notes,
        notion_url: project.notion_url, value: project.value,
        construtora: project.construtora,
      },
      {
        onSuccess: () => toast({ title: "Projeto duplicado!" }),
        onError: () => toast({ title: "Erro ao duplicar", variant: "destructive" }),
      },
    );
  }, [createProject, toast]);

  const handleArchive = useCallback((project: Project) => {
    updateProject.mutate(
      { id: project.id, updates: { status: "parado" } },
      {
        onSuccess: () => toast({ title: "Projeto pausado" }),
        onError: () => toast({ title: "Erro ao pausar", variant: "destructive" }),
      },
    );
  }, [updateProject, toast]);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    const project = pendingDelete;
    setPendingDelete(null);
    deleteProject.mutate(project.id, {
      onSuccess: () => toast({ title: "Excluido", description: `"${project.name}" foi removido.` }),
      onError: () => toast({ title: "Erro ao excluir", variant: "destructive" }),
    });
  }, [pendingDelete, deleteProject, toast]);

  const processed = useMemo(() => {
    let items = projects;
    if (toolbarState.customFilters.length > 0) {
      items = items.filter((p) =>
        toolbarState.customFilters.every((f) => {
          if (f.field === "status") return p.status === f.value;
          if (f.field === "priority") return p.priority === f.value;
          return true;
        }),
      );
    }
    items = sortProjects(items, sortField, sortDir);
    return groupProjects(items, toolbarState.groupBy);
  }, [projects, toolbarState, sortField, sortDir]);

  const insertColumnAt = useCallback(() => { setAddMenuOpen(true); }, [setAddMenuOpen]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <IconArrowsSort className="size-3 opacity-0 group-hover:opacity-40" />;
    return sortDir === "asc"
      ? <IconArrowUp className="size-3 text-foreground" />
      : <IconArrowDown className="size-3 text-foreground" />;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
          {visibleColumns.map((col) => (
            <div
              key={col.id}
              className={cn("group/col relative", col.hideOnMobile && "hidden md:flex")}
              style={{
                width: col.flex ? undefined : getColumnWidth(col),
                flex: col.flex ? "1 1 0%" : "0 0 auto",
                minWidth: col.flex ? col.minWidth : undefined,
              }}
            >
              <ColumnHeaderMenu
                column={col} sortField={sortField} sortDir={sortDir}
                isWrapped={wrappedColumns.has(col.id)} isFixed
                onSort={handleSortFromMenu} onFilter={handleFilterFromMenu}
                onGroup={handleGroupFromMenu} onHide={() => toggleHideColumn(col.id)}
                onToggleWrap={() => toggleWrapColumn(col.id)}
                onInsertLeft={insertColumnAt} onInsertRight={insertColumnAt}
              >
                <button
                  type="button"
                  className={cn(
                    "group flex w-full items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none",
                    col.sortable && "cursor-pointer hover:text-foreground",
                  )}
                >
                  {col.label}
                  {col.sortable && <SortIcon field={col.id} />}
                </button>
              </ColumnHeaderMenu>
              {col.resizable && (
                <div
                  className="absolute -right-1.5 top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 transition-opacity hover:opacity-100 group-hover/col:opacity-60"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleStartResize(col.id, e.clientX); }}
                >
                  <div className="h-4 w-0.5 rounded-full bg-primary" />
                </div>
              )}
            </div>
          ))}

          {extraColumns.map((col) => (
            <ColumnHeaderMenu
              key={col.id}
              column={{ id: col.id as SortField, label: col.label, width: col.width, defaultWidth: 140, minWidth: 80, sortable: false }}
              sortField={sortField} sortDir={sortDir}
              isWrapped={wrappedColumns.has(col.id)} isFixed={false}
              onSort={handleSortFromMenu} onFilter={handleFilterFromMenu}
              onGroup={handleGroupFromMenu} onHide={() => removeColumn(col.id)}
              onToggleWrap={() => toggleWrapColumn(col.id)}
              onInsertLeft={insertColumnAt} onInsertRight={insertColumnAt}
              onDuplicate={() => duplicateColumn(col.id)}
              onDelete={() => removeColumn(col.id)} icon={col.icon}
            >
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none hidden md:flex cursor-pointer hover:text-foreground",
                  col.width,
                )}
              >
                <col.icon className="size-3 opacity-60" />
                <span className="truncate">{col.label}</span>
              </button>
            </ColumnHeaderMenu>
          ))}

          <AddPropertyPopover
            open={addMenuOpen} onOpenChange={setAddMenuOpen}
            extraColumns={extraColumns} propertySearch={propertySearch}
            onPropertySearchChange={setPropertySearch}
            onAddSuggested={addSuggestedColumn} onAddType={addTypeColumn}
          />
        </div>

        {processed.every((g) => g.items.length === 0) ? (
          <EmptyState
            icon={IconFolderOpen}
            title="Nenhum projeto encontrado"
            description="Ajuste os filtros ou crie um novo projeto para começar."
            compact
          />
        ) : (
          processed.map((group) => (
            <div key={group.label || "all"}>
              {group.label && (
                <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2">
                  {group.color && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />}
                  <span className="text-xs font-semibold">{group.label}</span>
                  <span className="text-xs text-muted-foreground">({group.items.length})</span>
                </div>
              )}
              {group.items.map((project) => (
                <GridRow
                  key={project.id} project={project} extraColumns={extraColumns}
                  construtoras={construtoras} columnWidths={columnWidths}
                  onOpen={() => router.push(`/projetos/${project.id}`)}
                  onUpdate={handleUpdate} onDuplicate={() => handleDuplicate(project)}
                  onArchive={() => handleArchive(project)} onDelete={() => setPendingDelete(project)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        title="Excluir projeto"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Esta acao nao pode ser desfeita.`
            : "Esta acao nao pode ser desfeita."
        }
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
