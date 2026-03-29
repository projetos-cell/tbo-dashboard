"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconArrowLeft,
  IconPlus,
  IconSearch,
  IconCalendar,
  IconAlertTriangle,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconList,
  IconLayoutKanban,
  IconTimeline,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { usePropertyOptions, useCreatePropertyOption, useReorderPropertyOptions } from "@/features/projects/hooks/use-project-properties";
import { ConstrutoraCardSelect } from "./project-card-construtora";
import { cn } from "@/lib/utils";
import {
  format,
  isPast,
  differenceInDays,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachMonthOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

interface BUDetailDashboardProps {
  buName: string;
  projects: Project[];
  onBack: () => void;
  onNewProject: () => void;
}

type StatusFilterKey = "all" | ProjectStatusKey;
type SortField = "code" | "name" | "status" | "construtora" | "due_date";
type SortDir = "asc" | "desc";
type BUViewMode = "list" | "board" | "gantt";

const STATUS_ORDER: Record<string, number> = {
  em_andamento: 0,
  em_revisao: 1,
  concluido: 2,
};

export function BUDetailDashboard({ buName, projects, onBack, onNewProject }: BUDetailDashboardProps) {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<BUViewMode>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField]);

  const stats = useMemo(() => {
    const total = projects.length;
    const byStatus: Record<string, number> = {};
    for (const p of projects) {
      const key = p.status ?? "sem_status";
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }
    const concluido = byStatus["concluido"] ?? 0;
    const completionRate = total > 0 ? Math.round((concluido / total) * 100) : 0;
    return { total, byStatus, completionRate };
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (p.name ?? "").toLowerCase().includes(q);
        const codeMatch = (p.code ?? "").toLowerCase().includes(q);
        const construtoraMatch = (p.construtora ?? "").toLowerCase().includes(q);
        if (!nameMatch && !codeMatch && !construtoraMatch) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "code":
          cmp = (a.code ?? "").localeCompare(b.code ?? "", "pt-BR");
          break;
        case "name":
          cmp = (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
          break;
        case "status": {
          const oa = STATUS_ORDER[a.status] ?? 5;
          const ob = STATUS_ORDER[b.status] ?? 5;
          cmp = oa - ob;
          break;
        }
        case "construtora":
          cmp = (a.construtora ?? "").localeCompare(b.construtora ?? "", "pt-BR");
          break;
        case "due_date":
          cmp = (a.due_date_end ?? "9999").localeCompare(b.due_date_end ?? "9999");
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [filtered, sortField, sortDir]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 -ml-2">
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{buName}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {stats.total} projetos · {stats.completionRate}% concluído
          </p>
        </div>

        <ViewModeToggle value={viewMode} onChange={setViewMode} />

        <Button variant="outline" onClick={onNewProject} size="sm">
          <IconPlus className="mr-1 h-3.5 w-3.5" />
          Novo Projeto
        </Button>
      </div>

      {/* Status pills + search */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill
          label="Todos"
          count={stats.total}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
          ([key, config]) => (
            <StatusPill
              key={key}
              label={config.label}
              count={stats.byStatus[key] ?? 0}
              color={config.color}
              active={statusFilter === key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            />
          ),
        )}
        <div className="ml-auto relative">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-48 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Content by view mode */}
      {viewMode === "list" && (
        <ListView
          projects={sorted}
          sortField={sortField}
          sortDir={sortDir}
          onSort={toggleSort}
          onClickProject={(id) => router.push(`/projetos/${id}`)}
        />
      )}
      {viewMode === "board" && (
        <BoardView
          projects={filtered}
          buColor=""
          onClickProject={(id) => router.push(`/projetos/${id}`)}
        />
      )}
      {viewMode === "gantt" && (
        <GanttView
          projects={filtered}
          buColor=""
          onClickProject={(id) => router.push(`/projetos/${id}`)}
        />
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">Nenhum projeto encontrado</p>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   View Mode Toggle
   ═══════════════════════════════════════════════════════════════════════ */

function ViewModeToggle({ value, onChange }: { value: BUViewMode; onChange: (v: BUViewMode) => void }) {
  const modes: { key: BUViewMode; icon: typeof IconList; label: string }[] = [
    { key: "list", icon: IconList, label: "Lista" },
    { key: "board", icon: IconLayoutKanban, label: "Board" },
    { key: "gantt", icon: IconTimeline, label: "Gantt" },
  ];

  return (
    <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
      {modes.map(({ key, icon: ModeIcon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
            value === key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ModeIcon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LIST VIEW (table com sort)
   ═══════════════════════════════════════════════════════════════════════ */

function ListView({
  projects,
  sortField,
  sortDir,
  onSort,
  onClickProject,
}: {
  projects: Project[];
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
  onClickProject: (id: string) => void;
}) {
  const updateProject = useUpdateProject();

  const handleUpdate = useCallback((id: string, updates: ProjectUpdate) => {
    updateProject.mutate({ id, updates });
  }, [updateProject]);

  if (projects.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <SortableHeader label="Código" field="code" currentField={sortField} currentDir={sortDir} onSort={onSort} className="w-[120px] pl-4" />
            <SortableHeader label="Nome" field="name" currentField={sortField} currentDir={sortDir} onSort={onSort} className="min-w-[200px]" />
            <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={onSort} className="w-[140px]" />
            <SortableHeader label="Construtora" field="construtora" currentField={sortField} currentDir={sortDir} onSort={onSort} className="w-[180px]" />
            <SortableHeader label="Prazo" field="due_date" currentField={sortField} currentDir={sortDir} onSort={onSort} className="w-[150px] pr-4" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <ProjectTableRow key={project.id} project={project} onClick={() => onClickProject(project.id)} onUpdate={handleUpdate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BOARD VIEW (kanban por status)
   ═══════════════════════════════════════════════════════════════════════ */

type BoardColumn = { key: string; label: string; color: string; items: Project[] };

function BoardView({
  projects,
  buColor,
  onClickProject,
}: {
  projects: Project[];
  buColor: string;
  onClickProject: (id: string) => void;
}) {
  const { data: statusOptions } = usePropertyOptions("status");
  const createOption = useCreatePropertyOption();
  const reorderOptions = useReorderPropertyOptions("status");

  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  const allColumns = useMemo(() => {
    // Use DB options if available, otherwise fall back to hardcoded PROJECT_STATUS
    if (statusOptions && statusOptions.length > 0 && !statusOptions[0].id.startsWith("fallback-")) {
      return statusOptions.map((opt) => ({
        key: opt.key,
        label: opt.label,
        color: opt.color,
        items: projects.filter((p) => p.status === opt.key),
      }));
    }
    // Fallback: use PROJECT_STATUS constants
    return (Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
      ([key, config]) => ({
        key,
        label: config.label,
        color: config.color,
        items: projects.filter((p) => p.status === key),
      }),
    );
  }, [projects, statusOptions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!statusOptions) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const keys = allColumns.map((c) => c.key);
      const oldIdx = keys.indexOf(active.id as string);
      const newIdx = keys.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return;

      const reordered = arrayMove([...statusOptions], oldIdx, newIdx);
      reorderOptions.mutate(
        reordered.map((opt, i) => ({ id: opt.id, sort_order: i })),
      );
    },
    [allColumns, statusOptions, reorderOptions],
  );

  const handleAddColumn = useCallback(() => {
    const label = newColName.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (allColumns.some((c) => c.key === key)) return;

    createOption.mutate({
      property: "status",
      key,
      label,
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
      category: "in_progress",
      sort_order: (statusOptions?.length ?? 0),
    });
    setNewColName("");
    setAddingCol(false);
  }, [newColName, allColumns, statusOptions, createOption]);

  if (projects.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={allColumns.map((c) => c.key)} strategy={horizontalListSortingStrategy}>
          {allColumns.map((col) => (
            <SortableBoardColumn key={col.key} column={col} onClickProject={onClickProject} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add column — persisted as new status */}
      {addingCol ? (
        <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
          <div className="mb-3 border-b pb-2">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddColumn();
                if (e.key === "Escape") { setAddingCol(false); setNewColName(""); }
              }}
              onBlur={() => { if (!newColName.trim()) { setAddingCol(false); setNewColName(""); } }}
              placeholder="Nome do status..."
              className="w-full rounded border-0 bg-transparent text-xs font-semibold uppercase tracking-wider outline-none placeholder:text-muted-foreground/50 placeholder:normal-case"
              autoFocus
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCol(true)}
          className="flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconPlus className="size-4" />
        </button>
      )}
    </div>
  );
}

function SortableBoardColumn({
  column,
  onClickProject,
}: {
  column: BoardColumn;
  onClickProject: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-[280px] min-w-[280px] shrink-0 flex-col"
    >
      {/* Column header — draggable */}
      <div
        className="mb-3 flex cursor-grab items-center gap-2 border-b pb-2 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <span className="text-xs font-semibold uppercase tracking-wider">{column.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
          {column.items.length}
        </span>
      </div>
      {/* Cards */}
      <div className="space-y-2">
        {column.items.map((project) => (
          <BoardCard key={project.id} project={project} onClick={() => onClickProject(project.id)} />
        ))}
        {column.items.length === 0 && (
          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground/50">
            Sem projetos
          </div>
        )}
      </div>
    </div>
  );
}

function BoardCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const dueDate = project.due_date_end;
  const isOverdue = dueDate ? isPast(new Date(dueDate)) && project.status !== "concluido" : false;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border bg-card p-3 text-left transition-colors",
        "hover:bg-muted/40",
        isOverdue && "border-destructive/20",
      )}
    >
      {project.code && (
        <p className="text-[10px] text-muted-foreground font-mono mb-0.5">{project.code}</p>
      )}
      <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {project.name}
      </h4>
      {project.construtora && (
        <p className="text-[11px] text-muted-foreground mt-1 truncate">{project.construtora}</p>
      )}
      {dueDate && (
        <div className={cn("flex items-center gap-1 mt-2 text-[11px] text-muted-foreground", isOverdue && "text-destructive")}>
          <IconCalendar className="h-3 w-3" />
          {format(new Date(dueDate), "dd MMM", { locale: ptBR })}
          {isOverdue && <IconAlertTriangle className="h-3 w-3 ml-0.5" />}
        </div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GANTT VIEW (timeline de projetos)
   ═══════════════════════════════════════════════════════════════════════ */

type GanttScale = "days" | "weeks" | "months";

const SCALE_CELL_WIDTH: Record<GanttScale, number> = { days: 32, weeks: 48, months: 80 };

function GanttView({
  projects,
  buColor,
  onClickProject,
}: {
  projects: Project[];
  buColor: string;
  onClickProject: (id: string) => void;
}) {
  const [scale, setScale] = useState<GanttScale>("months");

  const ganttProjects = useMemo(() => {
    return projects
      .filter((p) => p.due_date_start || p.due_date_end)
      .sort((a, b) => (a.due_date_start ?? a.due_date_end ?? "9999").localeCompare(b.due_date_start ?? b.due_date_end ?? "9999"));
  }, [projects]);

  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (ganttProjects.length === 0) {
      const now = new Date();
      const s = startOfMonth(now);
      const e = endOfMonth(addMonths(now, 2));
      return { timelineStart: s, timelineEnd: e, totalDays: differenceInCalendarDays(e, s) + 1 };
    }
    let earliest = new Date("9999-12-31");
    let latest = new Date("1970-01-01");
    for (const p of ganttProjects) {
      const start = p.due_date_start ? new Date(p.due_date_start) : p.due_date_end ? new Date(p.due_date_end) : null;
      const end = p.due_date_end ? new Date(p.due_date_end) : p.due_date_start ? new Date(p.due_date_start) : null;
      if (start && start < earliest) earliest = start;
      if (end && end > latest) latest = end;
    }
    const s = startOfMonth(addMonths(earliest, -1));
    const e = endOfMonth(addMonths(latest, 1));
    return { timelineStart: s, timelineEnd: e, totalDays: differenceInCalendarDays(e, s) + 1 };
  }, [ganttProjects]);

  // Build header cells based on scale
  const headerCells = useMemo(() => {
    const cells: { key: string; label: string; days: number }[] = [];
    if (scale === "months") {
      const ms = eachMonthOfInterval({ start: timelineStart, end: timelineEnd });
      for (const month of ms) {
        const mEnd = endOfMonth(month);
        const days = differenceInCalendarDays(mEnd, month) + 1;
        cells.push({ key: month.toISOString(), label: format(month, "MMM yyyy", { locale: ptBR }), days });
      }
    } else if (scale === "weeks") {
      let cursor = new Date(timelineStart);
      while (cursor <= timelineEnd) {
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const end = weekEnd > timelineEnd ? timelineEnd : weekEnd;
        const days = differenceInCalendarDays(end, cursor) + 1;
        cells.push({ key: cursor.toISOString(), label: format(cursor, "dd MMM", { locale: ptBR }), days });
        cursor = new Date(end);
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      let cursor = new Date(timelineStart);
      while (cursor <= timelineEnd) {
        cells.push({ key: cursor.toISOString(), label: format(cursor, "dd", { locale: ptBR }), days: 1 });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return cells;
  }, [scale, timelineStart, timelineEnd]);

  const cellWidth = SCALE_CELL_WIDTH[scale];
  const timelineWidth = headerCells.reduce((sum, c) => sum + c.days * cellWidth, 0);

  const today = new Date();
  const todayOffset = differenceInCalendarDays(today, timelineStart);
  const todayPx = todayOffset * cellWidth;

  const scrollRef = useRef<HTMLDivElement>(null);

  if (ganttProjects.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhum projeto com datas definidas para exibir no Gantt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Scale toggle */}
      <div className="flex justify-end">
        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
          {(["days", "weeks", "months"] as GanttScale[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                scale === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "days" ? "Dias" : s === "weeks" ? "Semanas" : "Meses"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex">
          {/* Left: project names */}
          <div className="w-[240px] min-w-[240px] shrink-0 border-r">
            <div className="h-10 border-b bg-muted/30 flex items-center px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projeto</span>
            </div>
            {ganttProjects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onClickProject(p.id)}
                className="flex w-full items-center gap-2 border-b px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="h-1.5 w-1.5 rounded-full shrink-0 bg-foreground/30" />
                <span className="text-xs font-medium truncate">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Right: timeline */}
          <div className="flex-1 overflow-x-auto" ref={scrollRef}>
            {/* Header cells */}
            <div className="flex h-10 border-b bg-muted/30">
              {headerCells.map((cell) => (
                <div
                  key={cell.key}
                  className="shrink-0 border-r flex items-center justify-center"
                  style={{ width: cell.days * cellWidth }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {cell.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="relative" style={{ width: timelineWidth }}>
              {/* Today marker */}
              {todayPx >= 0 && todayPx <= timelineWidth && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-destructive/40 z-10"
                  style={{ left: todayPx }}
                />
              )}

              {ganttProjects.map((p) => {
                const pStart = p.due_date_start ? new Date(p.due_date_start) : p.due_date_end ? new Date(p.due_date_end) : timelineStart;
                const pEnd = p.due_date_end ? new Date(p.due_date_end) : p.due_date_start ? new Date(p.due_date_start) : timelineStart;

                const startOffset = differenceInCalendarDays(pStart, timelineStart);
                const duration = Math.max(differenceInCalendarDays(pEnd, pStart), 1);
                const leftPx = startOffset * cellWidth;
                const widthPx = duration * cellWidth;

                const isOverdue = p.due_date_end ? isPast(new Date(p.due_date_end)) && p.status !== "concluido" : false;

                return (
                  <div key={p.id} className="flex items-center border-b h-[37px] relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onClickProject(p.id)}
                          className={cn(
                            "absolute h-4 rounded-sm transition-all hover:opacity-80",
                            p.status === "concluido" ? "bg-muted-foreground/20" : "bg-foreground/60",
                            isOverdue && "bg-destructive/50",
                          )}
                          style={{
                            left: Math.max(leftPx, 0),
                            width: Math.max(widthPx, 8),
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted-foreground">
                          {format(pStart, "dd/MM/yy")} → {format(pEnd, "dd/MM/yy")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Shared Sub-Components
   ═══════════════════════════════════════════════════════════════════════ */

function SortableHeader({
  label,
  field,
  currentField,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentField === field;
  return (
    <th className={cn("py-2.5 text-left", className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        {isActive ? (
          currentDir === "asc" ? <IconChevronUp className="h-3 w-3" /> : <IconChevronDown className="h-3 w-3" />
        ) : (
          <IconSelector className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

function ProjectTableRow({ project, onClick, onUpdate }: { project: Project; onClick: () => void; onUpdate: (id: string, updates: ProjectUpdate) => void }) {
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const dueDate = project.due_date_end;
  const isOverdue = dueDate ? isPast(new Date(dueDate)) && project.status !== "concluido" : false;
  const daysLeft = dueDate && !isOverdue ? differenceInDays(new Date(dueDate), new Date()) : null;

  const handleRowClick = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't navigate if user clicked on an interactive element (button, input, etc.)
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, [role='combobox'], [data-slot='popover-trigger'], [data-radix-collection-item]")) return;
    onClick();
  }, [onClick]);

  return (
    <tr
      className={cn(
        "group border-b last:border-b-0 transition-colors cursor-pointer",
        "hover:bg-muted/40",
        isOverdue && "bg-red-50/50 dark:bg-red-950/10",
      )}
      onClick={handleRowClick}
    >
      {/* Código */}
      <td className="py-2 pl-4 pr-2">
        <span className="font-mono text-xs text-muted-foreground">{project.code ?? "—"}</span>
      </td>

      {/* Nome — inline editable */}
      <td className="py-2 pr-3">
        <InlineTextCell
          value={project.name ?? ""}
          onCommit={(v) => onUpdate(project.id, { name: v })}
          className="font-medium text-sm"
        />
      </td>

      {/* Status — select dropdown */}
      <td className="py-2 pr-3">
        <InlineStatusCell
          value={project.status}
          onCommit={(v) => onUpdate(project.id, { status: v })}
        />
      </td>

      {/* Construtora — dropdown with search */}
      <td className="py-2 pr-3">
        <ConstrutoraCardSelect
          value={project.construtora ?? ""}
          onSave={(v) => onUpdate(project.id, { construtora: v })}
        />
      </td>

      {/* Prazo — date picker */}
      <td className="py-2 pr-4">
        <InlineDateCell
          value={project.due_date_end}
          onCommit={(v) => onUpdate(project.id, { due_date_end: v })}
          isOverdue={isOverdue}
          daysLeft={daysLeft}
        />
      </td>
    </tr>
  );
}

/* ─── Inline Editing Cells ─── */

function InlineTextCell({
  value,
  onCommit,
  placeholder = "—",
  className: extraClass,
}: {
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onCommit(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  }, [draft, value, onCommit]);

  // Sync when value changes externally
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    if (!editing) setDraft(value);
  }

  if (editing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className="w-full rounded border border-primary/40 bg-transparent px-1.5 py-0.5 text-sm outline-none ring-1 ring-primary/20 focus:ring-primary/50"
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setDraft(value); setEditing(true); }}
      className={cn(
        "block truncate max-w-[360px] cursor-text rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-muted/60 transition-colors",
        extraClass,
      )}
      title="Clique para editar"
    >
      {value || placeholder}
    </span>
  );
}

function InlineStatusCell({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = PROJECT_STATUS[value as ProjectStatusKey];
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 150);
  }, []);

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-muted/60 transition-colors cursor-pointer"
      >
        {status ? (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium">
            {status.label}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border bg-popover p-1 shadow-md">
          {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (key !== value) onCommit(key);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                key === value ? "bg-muted font-medium" : "hover:bg-muted/60",
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineDateCell({
  value,
  onCommit,
  isOverdue,
  daysLeft,
}: {
  value: string | null;
  onCommit: (v: string | null) => void;
  isOverdue: boolean;
  daysLeft: number | null;
}) {
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    onCommit(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onCommit(null);
    setOpen(false);
  }

  return (
    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="rounded px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-muted/60 transition-colors cursor-pointer text-left"
          >
            {value ? (
              <div className="flex items-center gap-1.5">
                <span className={cn("text-xs flex items-center gap-1", isOverdue && "text-destructive font-medium")}>
                  <IconCalendar className="h-3 w-3 shrink-0" />
                  {format(new Date(value), "dd MMM yyyy", { locale: ptBR })}
                </span>
                {isOverdue && <IconAlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && !isOverdue && (
                  <span className="text-[10px] text-muted-foreground font-semibold">{daysLeft}d</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            locale={ptBR}
          />
          {value && (
            <div className="border-t px-3 py-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <IconX className="size-3" />
                Remover data
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function StatusPill({ label, count, active, onClick }: { label: string; count: number; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-all border-b-2",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className="tabular-nums text-muted-foreground/60">{count}</span>
    </button>
  );
}
