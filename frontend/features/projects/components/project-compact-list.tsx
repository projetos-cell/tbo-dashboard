"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconExternalLink,
  IconEdit,
  IconCopy,
  IconArchive,
  IconTrash,
  IconPlus,
  IconAlignLeft,
  IconHash,
  IconSelect,
  IconList,
  IconLoader,
  IconCalendar,
  IconUsers,
  IconPaperclip,
  IconCheckbox,
  IconLink,
  IconAt,
  IconPhone,
  IconCornerDownRight,
  IconSearch,
  IconMathFunction,
  IconId,
  IconMapPin,
  IconClock,
  IconUserCircle,
  IconX,
  IconAdjustments,
  IconTransform,
  IconSparkles,
  IconFilter,
  IconSortAscending,
  IconLayoutRows,
  IconMathSymbols,
  IconSnowflake,
  IconEyeOff,
  IconBraces,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconInfoCircle,
  IconChevronRight,
  IconBuilding,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  useUpdateProject,
  useDeleteProject,
  useCreateProject,
} from "@/features/projects/hooks/use-projects";
import { useTeamMembers } from "@/hooks/use-team";
import { useToast } from "@/hooks/use-toast";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import {
  ProjectListToolbar,
  type ListToolbarState,
  type GroupField,
} from "./project-list-toolbar";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SortField = "code" | "name" | "status" | "construtora" | "owner" | "due_date" | "created_at";
type SortDir = "asc" | "desc";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_RE.test(value);
}

function getGroupLabel(value: string, field: GroupField): string {
  if (!value || isUUID(value)) {
    switch (field) {
      case "construtora":
        return "Sem construtora";
      case "status":
        return "Sem status";
      case "priority":
        return "Sem prioridade";
      case "owner":
        return "Sem responsável";
      default:
        return "Outros";
    }
  }
  return value;
}

function sortProjects(projects: Project[], field: SortField, dir: SortDir): Project[] {
  return [...projects].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "code":
        cmp = (a.code ?? "").localeCompare(b.code ?? "");
        break;
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
        break;
      case "status":
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
        break;
      case "construtora":
        cmp = (a.construtora ?? "").localeCompare(b.construtora ?? "", "pt-BR");
        break;
      case "owner":
        cmp = (a.owner_name ?? "").localeCompare(b.owner_name ?? "", "pt-BR");
        break;
      case "due_date":
        cmp = (a.due_date_end ?? "").localeCompare(b.due_date_end ?? "");
        break;
      case "created_at":
        cmp = (a.created_at ?? "").localeCompare(b.created_at ?? "");
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

function groupProjects(
  projects: Project[],
  field: GroupField,
): { label: string; color?: string; items: Project[] }[] {
  if (field === "none") return [{ label: "", items: projects }];

  const groups = new Map<string, Project[]>();
  const order: string[] = [];

  for (const p of projects) {
    let key: string;
    switch (field) {
      case "status":
        key = p.status ?? "sem_status";
        break;
      case "construtora":
        key = p.construtora && !isUUID(p.construtora) ? p.construtora : "sem_construtora";
        break;
      case "priority":
        key = p.priority ?? "sem_prioridade";
        break;
      case "owner":
        key = p.owner_name ?? "sem_responsavel";
        break;
      default:
        key = "all";
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(p);
  }

  return order.map((key) => {
    let label = getGroupLabel(key, field);
    let color: string | undefined;
    if (field === "status") {
      const status = PROJECT_STATUS[key as ProjectStatusKey];
      if (status) {
        label = status.label;
        color = status.color;
      }
    }
    return { label, color, items: groups.get(key)! };
  });
}

// ─── Fixed columns ────────────────────────────────────────────────────────────

interface ColumnConfig {
  id: SortField;
  label: string;
  width: string;
  sortable: boolean;
  hideOnMobile?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { id: "code", label: "Código", width: "w-[90px]", sortable: true },
  { id: "name", label: "Nome", width: "flex-1 min-w-[200px]", sortable: true },
  { id: "status", label: "Status", width: "w-[130px]", sortable: true },
  { id: "construtora", label: "Construtora", width: "w-[160px]", sortable: true, hideOnMobile: true },
  { id: "owner", label: "Responsável", width: "w-[140px]", sortable: true, hideOnMobile: true },
  { id: "due_date", label: "Prazo", width: "w-[120px]", sortable: true, hideOnMobile: true },
];

// ─── Extra column definition ─────────────────────────────────────────────────

interface ExtraColumn {
  id: string;
  label: string;
  field: string; // project field key or "custom"
  type: "text" | "date" | "number" | "select" | "url" | "email" | "checkbox" | "readonly";
  icon: typeof IconAlignLeft;
  width: string;
}

// Maps suggested properties to real project fields
const SUGGESTED_COLUMNS: ExtraColumn[] = [
  { id: "notes", label: "Descrição", field: "notes", type: "text", icon: IconAlignLeft, width: "w-[180px]" },
  { id: "due_date_start", label: "Data de Início", field: "due_date_start", type: "date", icon: IconCalendar, width: "w-[130px]" },
  { id: "due_date_end_extra", label: "Data de Término", field: "due_date_end", type: "date", icon: IconCalendar, width: "w-[130px]" },
  { id: "priority", label: "Prioridade", field: "priority", type: "text", icon: IconSelect, width: "w-[120px]" },
];

// Maps generic types to project fields (where applicable)
const TYPE_TO_COLUMN: Record<string, Omit<ExtraColumn, "id">> = {
  text: { label: "Texto", field: "notes", type: "text", icon: IconAlignLeft, width: "w-[180px]" },
  number: { label: "Valor", field: "value", type: "number", icon: IconHash, width: "w-[120px]" },
  select: { label: "Prioridade", field: "priority", type: "text", icon: IconSelect, width: "w-[120px]" },
  status: { label: "Status Secundário", field: "custom", type: "text", icon: IconLoader, width: "w-[130px]" },
  date: { label: "Data de Início", field: "due_date_start", type: "date", icon: IconCalendar, width: "w-[130px]" },
  person: { label: "Responsável", field: "owner_name", type: "select", icon: IconUsers, width: "w-[140px]" },
  files: { label: "Arquivos", field: "custom", type: "readonly", icon: IconPaperclip, width: "w-[120px]" },
  checkbox: { label: "Verificação", field: "custom", type: "checkbox", icon: IconCheckbox, width: "w-[100px]" },
  url: { label: "URL", field: "notion_url", type: "url", icon: IconLink, width: "w-[160px]" },
  email: { label: "E-mail", field: "custom", type: "email", icon: IconAt, width: "w-[160px]" },
  phone: { label: "Telefone", field: "custom", type: "text", icon: IconPhone, width: "w-[130px]" },
  relation: { label: "Relação", field: "custom", type: "readonly", icon: IconCornerDownRight, width: "w-[140px]" },
  rollup: { label: "Rollup", field: "custom", type: "readonly", icon: IconSearch, width: "w-[120px]" },
  formula: { label: "Fórmula", field: "custom", type: "readonly", icon: IconMathFunction, width: "w-[120px]" },
  id: { label: "ID", field: "code", type: "readonly", icon: IconId, width: "w-[100px]" },
  location: { label: "Local", field: "custom", type: "text", icon: IconMapPin, width: "w-[140px]" },
  created_at: { label: "Criado em", field: "created_at", type: "readonly", icon: IconClock, width: "w-[130px]" },
  updated_at: { label: "Última edição", field: "updated_at", type: "readonly", icon: IconClock, width: "w-[130px]" },
  created_by: { label: "Criado por", field: "owner_name", type: "readonly", icon: IconUserCircle, width: "w-[140px]" },
  updated_by: { label: "Última edição por", field: "custom", type: "readonly", icon: IconUserCircle, width: "w-[140px]" },
  multi_select: { label: "Tags", field: "bus", type: "readonly", icon: IconList, width: "w-[140px]" },
};

// ─── Property types for "+" menu ─────────────────────────────────────────────

const PROPERTY_TYPES_SUGGESTED = [
  { icon: IconAlignLeft, label: "Descrição do Projeto", key: "notes" },
  { icon: IconCalendar, label: "Data de Início", key: "due_date_start" },
  { icon: IconCalendar, label: "Data de Término", key: "due_date_end_extra" },
  { icon: IconSelect, label: "Prioridade", key: "priority" },
];

const PROPERTY_TYPES = [
  { icon: IconAlignLeft, label: "Texto", type: "text" },
  { icon: IconHash, label: "Número", type: "number" },
  { icon: IconSelect, label: "Selecionar", type: "select" },
  { icon: IconList, label: "Seleção múltipla", type: "multi_select" },
  { icon: IconLoader, label: "Status", type: "status" },
  { icon: IconCalendar, label: "Data", type: "date" },
  { icon: IconUsers, label: "Pessoa", type: "person" },
  { icon: IconPaperclip, label: "Arquivos e mídia", type: "files" },
  { icon: IconCheckbox, label: "Caixa de seleção", type: "checkbox" },
  { icon: IconLink, label: "URL", type: "url" },
  { icon: IconAt, label: "E-mail", type: "email" },
  { icon: IconPhone, label: "Telefone", type: "phone" },
  { icon: IconCornerDownRight, label: "Relação", type: "relation" },
  { icon: IconSearch, label: "Rollup", type: "rollup" },
  { icon: IconMathFunction, label: "Fórmula", type: "formula" },
  { icon: IconId, label: "ID", type: "id" },
  { icon: IconMapPin, label: "Local", type: "location" },
  { icon: IconClock, label: "Criado em", type: "created_at" },
  { icon: IconClock, label: "Última edição", type: "updated_at" },
  { icon: IconUserCircle, label: "Criado por", type: "created_by" },
  { icon: IconUserCircle, label: "Última edição por", type: "updated_by" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ProjectCompactListProps {
  projects: Project[];
}

export function ProjectCompactList({ projects }: ProjectCompactListProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const { toast } = useToast();

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [toolbarState, setToolbarState] = useState<ListToolbarState>({
    sortField: "name",
    sortDir: "asc",
    groupBy: "none",
    customFilters: [],
  });
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [propertySearch, setPropertySearch] = useState("");
  const [extraColumns, setExtraColumns] = useState<ExtraColumn[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Unique construtora list for dropdown
  const construtoras = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.construtora && !isUUID(p.construtora)) set.add(p.construtora);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);

  const handleHeaderClick = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const handleUpdate = useCallback(
    (id: string, updates: Record<string, unknown>) => {
      updateProject.mutate({ id, updates } as never);
    },
    [updateProject],
  );

  // Add suggested column
  const addSuggestedColumn = useCallback((key: string) => {
    const col = SUGGESTED_COLUMNS.find((c) => c.id === key);
    if (!col) return;
    if (extraColumns.some((c) => c.id === col.id)) {
      toast({ title: `"${col.label}" já está visível` });
      return;
    }
    setExtraColumns((prev) => [...prev, col]);
    setAddMenuOpen(false);
  }, [extraColumns, toast]);

  // Add generic type column
  const addTypeColumn = useCallback((type: string) => {
    const config = TYPE_TO_COLUMN[type];
    if (!config) return;
    const id = `extra_${type}_${Date.now()}`;
    setExtraColumns((prev) => [...prev, { id, ...config }]);
    setAddMenuOpen(false);
  }, []);

  const removeColumn = useCallback((id: string) => {
    setExtraColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleDuplicate = useCallback(
    (project: Project) => {
      createProject.mutate(
        {
          tenant_id: project.tenant_id,
          name: `${project.name} (cópia)`,
          status: project.status,
          client: project.client,
          client_company: project.client_company,
          client_id: project.client_id,
          owner_name: project.owner_name,
          owner_id: project.owner_id,
          priority: project.priority,
          due_date_start: project.due_date_start,
          due_date_end: project.due_date_end,
          bus: project.bus,
          services: project.services,
          notes: project.notes,
          notion_url: project.notion_url,
          value: project.value,
          construtora: project.construtora,
        },
        {
          onSuccess: () => toast({ title: "Projeto duplicado!" }),
          onError: () => toast({ title: "Erro ao duplicar", variant: "destructive" }),
        },
      );
    },
    [createProject, toast],
  );

  const handleArchive = useCallback(
    (project: Project) => {
      updateProject.mutate(
        { id: project.id, updates: { status: "parado" } },
        {
          onSuccess: () => toast({ title: "Projeto pausado" }),
          onError: () => toast({ title: "Erro ao pausar", variant: "destructive" }),
        },
      );
    },
    [updateProject, toast],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    const project = pendingDelete;
    setPendingDelete(null);
    deleteProject.mutate(project.id, {
      onSuccess: () =>
        toast({ title: "Excluído", description: `"${project.name}" foi removido.` }),
      onError: () =>
        toast({ title: "Erro ao excluir", variant: "destructive" }),
    });
  }, [pendingDelete, deleteProject, toast]);

  const processed = useMemo(() => {
    let items = projects;

    if (toolbarState.customFilters.length > 0) {
      items = items.filter((p) =>
        toolbarState.customFilters.every((f) => {
          switch (f.field) {
            case "status":
              return p.status === f.value;
            case "priority":
              return p.priority === f.value;
            default:
              return true;
          }
        }),
      );
    }

    items = sortProjects(items, sortField, sortDir);
    return groupProjects(items, toolbarState.groupBy);
  }, [projects, toolbarState, sortField, sortDir]);

  const filteredPropertyTypes = useMemo(() => {
    if (!propertySearch.trim()) return PROPERTY_TYPES;
    const q = propertySearch.toLowerCase();
    return PROPERTY_TYPES.filter((p) => p.label.toLowerCase().includes(q));
  }, [propertySearch]);

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [wrappedColumns, setWrappedColumns] = useState<Set<string>>(new Set());

  const toggleHideColumn = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  }, []);

  const toggleWrapColumn = useCallback((colId: string) => {
    setWrappedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  }, []);

  const visibleColumns = useMemo(
    () => COLUMNS.filter((col) => !hiddenColumns.has(col.id)),
    [hiddenColumns],
  );

  const handleSortFromMenu = useCallback(
    (field: SortField, dir: SortDir) => {
      setSortField(field);
      setSortDir(dir);
    },
    [],
  );

  const handleGroupFromMenu = useCallback(
    (field: GroupField) => {
      setToolbarState((prev) => ({ ...prev, groupBy: field }));
    },
    [],
  );

  const handleFilterFromMenu = useCallback(
    (field: string, value: string) => {
      setToolbarState((prev) => ({
        ...prev,
        customFilters: [
          ...prev.customFilters.filter((f) => f.field !== field),
          { id: `${field}_${Date.now()}`, field, value, label: `${field}: ${value}` },
        ],
      }));
    },
    [],
  );

  const insertColumnAt = useCallback(
    (refColId: string, position: "left" | "right") => {
      // For fixed columns, we can't really insert — open the add menu instead
      setAddMenuOpen(true);
    },
    [],
  );

  const duplicateColumn = useCallback(
    (colId: string) => {
      const col = extraColumns.find((c) => c.id === colId);
      if (col) {
        const newCol = { ...col, id: `${col.id}_dup_${Date.now()}` };
        setExtraColumns((prev) => [...prev, newCol]);
      }
    },
    [extraColumns],
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <IconArrowsSort className="size-3 opacity-0 group-hover:opacity-40" />;
    return sortDir === "asc" ? (
      <IconArrowUp className="size-3 text-foreground" />
    ) : (
      <IconArrowDown className="size-3 text-foreground" />
    );
  };

  return (
    <div className="space-y-3">
      <ProjectListToolbar state={toolbarState} onChange={setToolbarState} />

      <div className="overflow-x-auto rounded-lg border border-border/60">
        {/* Sortable header */}
        <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
          {visibleColumns.map((col) => (
            <ColumnHeaderMenu
              key={col.id}
              column={col}
              sortField={sortField}
              sortDir={sortDir}
              isWrapped={wrappedColumns.has(col.id)}
              isFixed
              onSort={handleSortFromMenu}
              onFilter={handleFilterFromMenu}
              onGroup={handleGroupFromMenu}
              onHide={() => toggleHideColumn(col.id)}
              onToggleWrap={() => toggleWrapColumn(col.id)}
              onInsertLeft={() => insertColumnAt(col.id, "left")}
              onInsertRight={() => insertColumnAt(col.id, "right")}
            >
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none",
                  col.width,
                  col.sortable && "cursor-pointer hover:text-foreground",
                  col.hideOnMobile && "hidden md:flex",
                )}
              >
                {col.label}
                {col.sortable && <SortIcon field={col.id} />}
              </button>
            </ColumnHeaderMenu>
          ))}

          {/* Extra dynamic columns headers */}
          {extraColumns.map((col) => (
            <ColumnHeaderMenu
              key={col.id}
              column={{ id: col.id as SortField, label: col.label, width: col.width, sortable: false }}
              sortField={sortField}
              sortDir={sortDir}
              isWrapped={wrappedColumns.has(col.id)}
              isFixed={false}
              onSort={handleSortFromMenu}
              onFilter={handleFilterFromMenu}
              onGroup={handleGroupFromMenu}
              onHide={() => removeColumn(col.id)}
              onToggleWrap={() => toggleWrapColumn(col.id)}
              onInsertLeft={() => insertColumnAt(col.id, "left")}
              onInsertRight={() => insertColumnAt(col.id, "right")}
              onDuplicate={() => duplicateColumn(col.id)}
              onDelete={() => removeColumn(col.id)}
              icon={col.icon}
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

          {/* "+" Add property column */}
          <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Adicionar propriedade"
              >
                <IconPlus className="size-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0" sideOffset={4}>
              {/* Suggested */}
              <div className="border-b border-border/60 p-2">
                <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Sugeridas
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {PROPERTY_TYPES_SUGGESTED.map((prop) => {
                    const alreadyAdded = extraColumns.some((c) => c.id === prop.key);
                    return (
                      <button
                        key={prop.key}
                        type="button"
                        disabled={alreadyAdded}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          alreadyAdded ? "cursor-not-allowed opacity-40" : "hover:bg-muted",
                        )}
                        onClick={() => addSuggestedColumn(prop.key)}
                      >
                        <prop.icon className="size-4 text-muted-foreground" />
                        <span className="truncate">{prop.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search + all types */}
              <div className="p-2">
                <div className="mb-1.5 flex items-center gap-1.5 px-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Selecionar tipo
                  </p>
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="h-5 w-full rounded border-0 bg-transparent pl-5 text-xs outline-none placeholder:text-muted-foreground"
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="grid max-h-[280px] grid-cols-2 gap-0.5 overflow-y-auto">
                  {filteredPropertyTypes.map((prop) => (
                    <button
                      key={prop.type}
                      type="button"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                      onClick={() => addTypeColumn(prop.type)}
                    >
                      <prop.icon className="size-4 text-muted-foreground" />
                      <span className="truncate">{prop.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Body */}
        {processed.every((g) => g.items.length === 0) ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhum projeto encontrado
          </p>
        ) : (
          processed.map((group) => (
            <div key={group.label || "all"}>
              {group.label && (
                <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2">
                  {group.color && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                  )}
                  <span className="text-xs font-semibold">{group.label}</span>
                  <span className="text-xs text-muted-foreground">
                    ({group.items.length})
                  </span>
                </div>
              )}
              {group.items.map((project) => (
                <GridRow
                  key={project.id}
                  project={project}
                  extraColumns={extraColumns}
                  construtoras={construtoras}
                  onOpen={() => router.push(`/projetos/${project.id}`)}
                  onUpdate={handleUpdate}
                  onDuplicate={() => handleDuplicate(project)}
                  onArchive={() => handleArchive(project)}
                  onDelete={() => setPendingDelete(project)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Excluir projeto"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Esta ação não pode ser desfeita.`
            : "Esta ação não pode ser desfeita."
        }
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

// ─── Extra Column Cell Renderer ───────────────────────────────────────────────

function ExtraColumnCell({
  project,
  column,
  onUpdate,
}: {
  project: Project;
  column: ExtraColumn;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) {
  const raw = column.field !== "custom"
    ? (project as Record<string, unknown>)[column.field]
    : null;

  // Person type (owner_name field) — use PersonSelect dropdown
  if (column.type === "select" && column.field === "owner_name") {
    return (
      <PersonSelect
        value={project.owner_name ?? ""}
        currentId={project.owner_id ?? ""}
        onChange={(id, name) =>
          onUpdate(project.id, { owner_id: id, owner_name: name })
        }
      />
    );
  }

  // Date type
  if (column.type === "date") {
    const val = typeof raw === "string" ? raw : null;
    return (
      <DateCell
        value={val}
        onChange={(v) => onUpdate(project.id, { [column.field]: v })}
      />
    );
  }

  // Readonly
  if (column.type === "readonly") {
    const display = raw != null ? String(raw) : "\u2014";
    if (column.field === "created_at" || column.field === "updated_at") {
      return (
        <span className="truncate text-xs text-muted-foreground">
          {typeof raw === "string"
            ? format(new Date(raw), "dd MMM yyyy", { locale: ptBR })
            : "\u2014"}
        </span>
      );
    }
    return <span className="truncate text-sm text-muted-foreground">{display}</span>;
  }

  // Number
  if (column.type === "number") {
    const num = typeof raw === "number" ? raw : null;
    return (
      <EditableText
        value={num != null ? String(num) : ""}
        onSave={(v) => onUpdate(project.id, { [column.field]: v ? Number(v) : null })}
        placeholder="\u2014"
        className="text-sm text-muted-foreground"
      />
    );
  }

  // URL
  if (column.type === "url") {
    const val = typeof raw === "string" ? raw : "";
    return val ? (
      <a
        href={val}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="truncate text-xs text-blue-500 hover:underline"
      >
        {val.replace(/^https?:\/\//, "").slice(0, 30)}
      </a>
    ) : (
      <span className="text-sm text-muted-foreground">{"\u2014"}</span>
    );
  }

  // Text / email / default
  const val = typeof raw === "string" ? raw : "";
  return (
    <EditableText
      value={val}
      onSave={(v) => onUpdate(project.id, { [column.field]: v })}
      placeholder="\u2014"
      className="text-sm text-muted-foreground"
    />
  );
}

// ─── Column Header Dropdown Menu (Notion-style) ──────────────────────────────

function ColumnHeaderMenu({
  column,
  sortField,
  sortDir,
  isWrapped,
  isFixed,
  onSort,
  onFilter,
  onGroup,
  onHide,
  onToggleWrap,
  onInsertLeft,
  onInsertRight,
  onDuplicate,
  onDelete,
  icon: Icon,
  children,
}: {
  column: ColumnConfig;
  sortField: SortField;
  sortDir: SortDir;
  isWrapped: boolean;
  isFixed: boolean;
  onSort: (field: SortField, dir: SortDir) => void;
  onFilter: (field: string, value: string) => void;
  onGroup: (field: GroupField) => void;
  onHide: () => void;
  onToggleWrap: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  icon?: typeof IconAlignLeft;
  children: React.ReactNode;
}) {
  const columnIcon = Icon ?? IconAlignLeft;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-0" sideOffset={4}>
        {/* Header with column name */}
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
          {Icon ? (
            <Icon className="size-4 text-muted-foreground" />
          ) : (
            <IconAlignLeft className="size-4 text-muted-foreground" />
          )}
          <span className="flex-1 text-sm font-medium">{column.label}</span>
          <button
            type="button"
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconInfoCircle className="size-4" />
          </button>
        </div>

        <div className="py-1">
          {/* Editar propriedade */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconAdjustments className="size-4 text-muted-foreground" />
              Editar propriedade
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                Nome: {column.label}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Alterar tipo */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconTransform className="size-4 text-muted-foreground" />
              Alterar tipo
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {PROPERTY_TYPES.slice(0, 10).map((pt) => (
                <DropdownMenuItem key={pt.type} className="flex items-center gap-2 text-sm">
                  <pt.icon className="size-4 text-muted-foreground" />
                  {pt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Preenchimento automático com IA */}
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm">
            <IconSparkles className="size-4 text-muted-foreground" />
            Preenchimento automático com IA
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          {/* Filtrar */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => {
              // Trigger filter for this column
              if (column.id === "status") {
                onFilter("status", "em_andamento");
              }
            }}
          >
            <IconFilter className="size-4 text-muted-foreground" />
            Filtrar
          </DropdownMenuItem>

          {/* Ordenar */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconSortAscending className="size-4 text-muted-foreground" />
              Ordenar
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm"
                onClick={() => onSort(column.id, "asc")}
              >
                <IconArrowUp className="size-3.5 text-muted-foreground" />
                Crescente (A→Z)
                {sortField === column.id && sortDir === "asc" && (
                  <span className="ml-auto text-xs text-muted-foreground">ativo</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-sm"
                onClick={() => onSort(column.id, "desc")}
              >
                <IconArrowDown className="size-3.5 text-muted-foreground" />
                Decrescente (Z→A)
                {sortField === column.id && sortDir === "desc" && (
                  <span className="ml-auto text-xs text-muted-foreground">ativo</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Agrupar */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={() => {
              const groupableFields: SortField[] = ["status", "construtora"];
              if (groupableFields.includes(column.id)) {
                onGroup(column.id as GroupField);
              }
            }}
          >
            <IconLayoutRows className="size-4 text-muted-foreground" />
            Agrupar
          </DropdownMenuItem>

          {/* Calcular */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm">
              <IconMathSymbols className="size-4 text-muted-foreground" />
              Calcular
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuItem className="text-sm">Contar todos</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar valores</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar únicos</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar vazios</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Contar não vazios</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">Porcentagem vazio</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Porcentagem não vazio</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          {/* Congelar — disabled */}
          <DropdownMenuItem disabled className="flex items-center gap-2 px-3 py-2 text-sm">
            <IconSnowflake className="size-4 text-muted-foreground" />
            Congelar
          </DropdownMenuItem>

          {/* Ocultar */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onHide}
          >
            <IconEyeOff className="size-4 text-muted-foreground" />
            Ocultar
          </DropdownMenuItem>

          {/* Encapsular conteúdo */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onToggleWrap}
          >
            <IconBraces className="size-4 text-muted-foreground" />
            Encapsular conteúdo
            {isWrapped && <span className="ml-auto text-xs text-muted-foreground">ativo</span>}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="py-1">
          {/* Inserir à esquerda */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onInsertLeft}
          >
            <IconColumnInsertLeft className="size-4 text-muted-foreground" />
            Inserir à esquerda
          </DropdownMenuItem>

          {/* Inserir à direita */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onInsertRight}
          >
            <IconColumnInsertRight className="size-4 text-muted-foreground" />
            Inserir à direita
          </DropdownMenuItem>

          {/* Duplicar propriedade */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm"
            onClick={onDuplicate}
            disabled={isFixed}
          >
            <IconCopy className="size-4 text-muted-foreground" />
            Duplicar propriedade
          </DropdownMenuItem>

          {/* Excluir propriedade */}
          <DropdownMenuItem
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 focus:text-red-600"
            onClick={onDelete}
            disabled={isFixed}
          >
            <IconTrash className="size-4" />
            Excluir propriedade
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Grid Row with Context Menu + Inline Editing ──────────────────────────────

function GridRow({
  project,
  extraColumns,
  construtoras,
  onOpen,
  onUpdate,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  project: Project;
  extraColumns: ExtraColumn[];
  construtoras: string[];
  onOpen: () => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex items-center gap-0 border-b border-border/30 px-3 py-2 transition-colors last:border-b-0 hover:bg-muted/30">
          {/* Code — read only */}
          <div className="w-[90px] px-2">
            <Link
              href={`/projetos/${project.id}`}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline"
            >
              {project.code || "\u2014"}
            </Link>
          </div>

          {/* Name — editable */}
          <div className="min-w-[200px] flex-1 px-2">
            <EditableText
              value={project.name ?? ""}
              onSave={(v) => onUpdate(project.id, { name: v })}
              className="text-sm font-medium"
              linkHref={`/projetos/${project.id}`}
            />
          </div>

          {/* Status — editable dropdown */}
          <div className="w-[130px] px-2">
            <StatusSelect
              value={project.status ?? ""}
              onChange={(v) => onUpdate(project.id, { status: v })}
            />
          </div>

          {/* Construtora — editable dropdown */}
          <div className="hidden w-[160px] px-2 md:block">
            <ConstrutoraSelect
              value={project.construtora && !isUUID(project.construtora) ? project.construtora : ""}
              construtoras={construtoras}
              onChange={(v) => onUpdate(project.id, { construtora: v })}
            />
          </div>

          {/* Owner — editable dropdown */}
          <div className="hidden w-[140px] px-2 md:block">
            <PersonSelect
              value={project.owner_name ?? ""}
              currentId={project.owner_id ?? ""}
              onChange={(id, name) =>
                onUpdate(project.id, { owner_id: id, owner_name: name })
              }
            />
          </div>

          {/* Due date — editable */}
          <div className="hidden w-[120px] px-2 md:block">
            <DateCell
              value={project.due_date_end}
              onChange={(v) => onUpdate(project.id, { due_date_end: v })}
            />
          </div>

          {/* Extra dynamic columns */}
          {extraColumns.map((col) => (
            <div key={col.id} className={cn("hidden px-2 md:block", col.width)}>
              <ExtraColumnCell
                project={project}
                column={col}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onOpen}>
          <IconEdit className="mr-2 size-3.5" />
          Abrir projeto
        </ContextMenuItem>
        {project.notion_url && (
          <ContextMenuItem
            onClick={() => window.open(project.notion_url!, "_blank")}
          >
            <IconExternalLink className="mr-2 size-3.5" />
            Abrir no Notion
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDuplicate}>
          <IconCopy className="mr-2 size-3.5" />
          Duplicar projeto
        </ContextMenuItem>
        <ContextMenuItem onClick={onArchive}>
          <IconArchive className="mr-2 size-3.5" />
          Pausar projeto
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <IconTrash className="mr-2 size-3.5" />
          Excluir projeto
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ─── Inline Editable Text ─────────────────────────────────────────────────────

function EditableText({
  value,
  onSave,
  placeholder = "\u2014",
  className,
  linkHref,
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  linkHref?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "w-full rounded border border-border bg-background px-1.5 py-0.5 outline-none ring-1 ring-ring/30",
          className,
        )}
      />
    );
  }

  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className={cn("cursor-pointer truncate hover:underline", className)}
        onClick={(e) => {
          if (e.altKey) {
            e.preventDefault();
            setEditing(true);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setEditing(true);
        }}
      >
        {value || placeholder}
      </Link>
    );
  }

  return (
    <span
      className={cn("cursor-text truncate", className)}
      onClick={() => setEditing(true)}
    >
      {value || placeholder}
    </span>
  );
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const current = PROJECT_STATUS[value as ProjectStatusKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {current ? (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              style={{ backgroundColor: current.bg, color: current.color }}
            >
              {current.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer text-xs text-muted-foreground">
              {isUUID(value) ? "Sem status" : value || "Sem status"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs">Alterar status</DropdownMenuLabel>
        {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
              }}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Person Dropdown Select ───────────────────────────────────────────────────

function PersonSelect({
  value,
  currentId,
  onChange,
}: {
  value: string;
  currentId: string;
  onChange: (id: string | null, name: string | null) => void;
}) {
  const { data: members } = useTeamMembers({ is_active: true });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.full_name.toLowerCase().includes(q));
  }, [members, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {value ? (
            <>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700"
              >
                {value
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1">
          {/* Remove option */}
          {currentId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconUserCircle className="size-4" />
              <span>Remover responsável</span>
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado
            </p>
          ) : (
            filtered.map((member) => {
              const isSelected = member.id === currentId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(member.id, member.full_name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                    {member.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="flex-1 truncate text-left">{member.full_name}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">atual</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Construtora Picker Cell ──────────────────────────────────────────────────

function ConstrutoraSelect({
  value,
  construtoras,
  onChange,
}: {
  value: string;
  construtoras: string[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return construtoras;
    const q = search.toLowerCase();
    return construtoras.filter((c) => c.toLowerCase().includes(q));
  }, [construtoras, search]);

  // Check if typed value is new (not in list)
  const isNewValue = search.trim() && !construtoras.some(
    (c) => c.toLowerCase() === search.trim().toLowerCase()
  );

  function handleSelect(v: string) {
    onChange(v);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setTimeout(() => inputRef.current?.focus(), 50);
        else setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {value ? (
            <>
              <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" sideOffset={4}>
        <div className="border-b border-border/60 p-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) {
                handleSelect(search.trim().toUpperCase());
              }
            }}
            placeholder="Buscar ou criar..."
            className="h-7 w-full rounded border-0 bg-muted/40 px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1">
          {/* Remove option */}
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <IconX className="size-3.5" />
              <span>Remover construtora</span>
            </button>
          )}
          {/* New value option */}
          {isNewValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(search.trim().toUpperCase());
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-blue-600 transition-colors hover:bg-muted"
            >
              <IconPlus className="size-3.5" />
              <span>Criar &quot;{search.trim().toUpperCase()}&quot;</span>
            </button>
          )}
          {filtered.length === 0 && !isNewValue ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              Nenhuma construtora encontrada
            </p>
          ) : (
            filtered.map((c) => {
              const isSelected = c === value;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(c);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                    isSelected && "bg-muted/60",
                  )}
                >
                  <IconBuilding className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-left">{c}</span>
                  {isSelected && (
                    <IconCheck className="size-3.5 text-foreground" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Date Picker Cell ─────────────────────────────────────────────────────────

function DateCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const dateObj = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconCalendar className="size-3" />
          <span>
            {value
              ? format(new Date(value), "dd MMM yyyy", { locale: ptBR })
              : "\u2014"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
