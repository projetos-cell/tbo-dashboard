"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPlus,
  IconCalendarClock,
  IconDots,
  IconPencil,
  IconTrash,
  IconGripVertical,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { RequireRole } from "@/features/auth/components/require-role";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useScheduledReports,
  useDeleteScheduledReport,
  useToggleReportActive,
} from "@/features/relatorios/hooks/use-reports";
import { ScheduledReportForm } from "@/features/relatorios/components/scheduled-report-form";
import type { ScheduledReport, ReportType, ReportFrequency, ReportFormat } from "@/features/relatorios/services/scheduled-reports";

// ── Constants ─────────────────────────────────────────────────────────────────

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  quarterly: "Trimestral",
};

export const TYPE_LABELS: Record<string, string> = {
  projects: "Projetos",
  finance: "Financeiro",
  commercial: "Comercial",
  people: "Pessoas",
  custom: "Personalizado",
};

export const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  csv: "CSV",
  xlsx: "Excel",
};

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "name" | "report_type" | "frequency" | "next_send_at" | "format";
type SortDir = "asc" | "desc";
type GroupBy = "none" | "report_type" | "frequency";
type StatusFilter = "all" | "active" | "paused";

// ── Sortable Row ──────────────────────────────────────────────────────────────

function SortableReportRow({
  report,
  onEdit,
  onDeleteRequest,
  onToggle,
}: {
  report: ScheduledReport;
  onEdit: (r: ScheduledReport) => void;
  onDeleteRequest: (r: ScheduledReport) => void;
  onToggle: (r: ScheduledReport) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: report.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-6 px-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Reordenar"
        >
          <IconGripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{report.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {TYPE_LABELS[report.report_type] ?? report.report_type}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {FREQUENCY_LABELS[report.frequency] ?? report.frequency}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {report.next_send_at
          ? new Date(report.next_send_at).toLocaleDateString("pt-BR")
          : "—"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {report.last_sent_at
          ? new Date(report.last_sent_at).toLocaleDateString("pt-BR")
          : "Nunca"}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {FORMAT_LABELS[report.format] ?? report.format}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={report.is_active}
          onCheckedChange={() => onToggle(report)}
        />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(report)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteRequest(report)}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ── Group Header Row ──────────────────────────────────────────────────────────

function GroupHeaderRow({ label, count }: { label: string; count: number }) {
  return (
    <TableRow className="bg-muted/40 hover:bg-muted/40">
      <TableCell colSpan={9} className="py-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
        {label}
        <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
      </TableCell>
    </TableRow>
  );
}

// ── Sortable Header ───────────────────────────────────────────────────────────

function SortableHeader({
  label,
  field,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (f: SortKey) => void;
}) {
  const active = sortKey === field;
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "asc" ? (
            <IconChevronUp className="h-3 w-3" />
          ) : (
            <IconChevronDown className="h-3 w-3" />
          )
        ) : null}
      </span>
    </TableHead>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

interface ToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: ReportType | "all";
  setTypeFilter: (v: ReportType | "all") => void;
  frequencyFilter: ReportFrequency | "all";
  setFrequencyFilter: (v: ReportFrequency | "all") => void;
  formatFilter: ReportFormat | "all";
  setFormatFilter: (v: ReportFormat | "all") => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  groupBy: GroupBy;
  setGroupBy: (v: GroupBy) => void;
}

function Toolbar({
  search, setSearch,
  typeFilter, setTypeFilter,
  frequencyFilter, setFrequencyFilter,
  formatFilter, setFormatFilter,
  statusFilter, setStatusFilter,
  groupBy, setGroupBy,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-48">
        <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar relatório..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ReportType | "all")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={frequencyFilter} onValueChange={(v) => setFrequencyFilter(v as ReportFrequency | "all")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Frequência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as freq.</SelectItem>
          {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={formatFilter} onValueChange={(v) => setFormatFilter(v as ReportFormat | "all")}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Formato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.entries(FORMAT_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="paused">Pausados</SelectItem>
        </SelectContent>
      </Select>
      <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Agrupar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem agrupamento</SelectItem>
          <SelectItem value="report_type">Por tipo</SelectItem>
          <SelectItem value="frequency">Por frequência</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ── KPI Strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ reports }: { reports: ScheduledReport[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{reports.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground">Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-600">
            {reports.filter((r) => r.is_active).length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground">Pausados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-muted-foreground">
            {reports.filter((r) => !r.is_active).length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AgendadosPage() {
  const { data: rawReports = [], isLoading } = useScheduledReports();
  const toggleActive = useToggleReportActive();
  const deleteReport = useDeleteScheduledReport();

  const [createOpen, setCreateOpen] = useState(false);
  const [editReport, setEditReport] = useState<ScheduledReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledReport | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  const [frequencyFilter, setFrequencyFilter] = useState<ReportFrequency | "all">("all");
  const [formatFilter, setFormatFilter] = useState<ReportFormat | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Local DnD order (no DB persist — no sort_order column)
  const [order, setOrder] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSort = useCallback((field: SortKey) => {
    setSortKey((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return field;
    });
  }, []);

  const handleToggle = useCallback(async (report: ScheduledReport) => {
    await toggleActive.mutateAsync({ id: report.id, isActive: !report.is_active });
    toast.success(report.is_active ? "Relatório pausado." : "Relatório ativado.");
  }, [toggleActive]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteReport.mutateAsync(deleteTarget.id);
    toast.success("Relatório removido.");
    setDeleteTarget(null);
  }, [deleteReport, deleteTarget]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const ids = prev.length > 0 ? prev : rawReports.map((r) => r.id);
      const oldIdx = ids.indexOf(String(active.id));
      const newIdx = ids.indexOf(String(over.id));
      return arrayMove(ids, oldIdx, newIdx);
    });
  }, [rawReports]);

  const filteredSorted = useMemo(() => {
    let items = [...rawReports];

    // Apply order if set
    if (order.length > 0) {
      const idxMap = new Map(order.map((id, i) => [id, i]));
      items.sort((a, b) => (idxMap.get(a.id) ?? 999) - (idxMap.get(b.id) ?? 999));
    }

    // Filter
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") items = items.filter((r) => r.report_type === typeFilter);
    if (frequencyFilter !== "all") items = items.filter((r) => r.frequency === frequencyFilter);
    if (formatFilter !== "all") items = items.filter((r) => r.format === formatFilter);
    if (statusFilter === "active") items = items.filter((r) => r.is_active);
    if (statusFilter === "paused") items = items.filter((r) => !r.is_active);

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "report_type") cmp = a.report_type.localeCompare(b.report_type);
      else if (sortKey === "frequency") cmp = a.frequency.localeCompare(b.frequency);
      else if (sortKey === "next_send_at") {
        cmp = (a.next_send_at ?? "").localeCompare(b.next_send_at ?? "");
      } else if (sortKey === "format") cmp = a.format.localeCompare(b.format);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [rawReports, order, search, typeFilter, frequencyFilter, formatFilter, statusFilter, sortKey, sortDir]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return new Map([["__all__", filteredSorted]]);
    const map = new Map<string, ScheduledReport[]>();
    for (const r of filteredSorted) {
      const key = groupBy === "report_type" ? r.report_type : r.frequency;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [filteredSorted, groupBy]);

  const allIds = useMemo(() => filteredSorted.map((r) => r.id), [filteredSorted]);

  return (
    <RequireRole module="relatorios" minRole="admin">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/relatorios">Relatórios</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Agendados</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconCalendarClock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Relatórios Agendados</h1>
              <p className="text-sm text-muted-foreground">
                Configure envios automáticos para sua equipe.
              </p>
            </div>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Relatório Agendado</DialogTitle>
              </DialogHeader>
              <ScheduledReportForm
                onSuccess={() => setCreateOpen(false)}
                onCancel={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <KpiStrip reports={rawReports} />

        <Toolbar
          search={search} setSearch={setSearch}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          frequencyFilter={frequencyFilter} setFrequencyFilter={setFrequencyFilter}
          formatFilter={formatFilter} setFormatFilter={setFormatFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          groupBy={groupBy} setGroupBy={setGroupBy}
        />

        {isLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        ) : filteredSorted.length === 0 ? (
          <EmptyState
            title="Nenhum relatório encontrado"
            description="Ajuste os filtros ou crie um novo agendamento."
          />
        ) : (
          <Card>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-6 px-2" />
                      <SortableHeader label="Nome" field="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Tipo" field="report_type" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Frequência" field="frequency" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Próximo Envio" field="next_send_at" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <TableHead>Último Envio</TableHead>
                      <SortableHeader label="Formato" field="format" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                      <TableHead>Ativo</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(grouped.entries()).map(([groupKey, groupItems]) => (
                      <>
                        {groupBy !== "none" && (
                          <GroupHeaderRow
                            key={`header-${groupKey}`}
                            label={
                              groupBy === "report_type"
                                ? (TYPE_LABELS[groupKey] ?? groupKey)
                                : (FREQUENCY_LABELS[groupKey] ?? groupKey)
                            }
                            count={groupItems.length}
                          />
                        )}
                        {groupItems.map((report) => (
                          <SortableReportRow
                            key={report.id}
                            report={report}
                            onEdit={setEditReport}
                            onDeleteRequest={setDeleteTarget}
                            onToggle={handleToggle}
                          />
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </Card>
        )}

        {/* Edit dialog */}
        <Dialog open={!!editReport} onOpenChange={(open) => !open && setEditReport(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Relatório Agendado</DialogTitle>
            </DialogHeader>
            {editReport && (
              <ScheduledReportForm
                report={editReport}
                onSuccess={() => setEditReport(null)}
                onCancel={() => setEditReport(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar relatório agendado?</AlertDialogTitle>
              <AlertDialogDescription>
                O relatório <strong>{deleteTarget?.name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequireRole>
  );
}
