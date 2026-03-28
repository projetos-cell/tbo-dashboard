"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { ScheduledReport } from "@/features/relatorios/services/scheduled-reports";

// ── Constants ─────────────────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  quarterly: "Trimestral",
};

const TYPE_LABELS: Record<string, string> = {
  projects: "Projetos",
  finance: "Financeiro",
  commercial: "Comercial",
  people: "Pessoas",
  custom: "Personalizado",
};

const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  csv: "CSV",
  xlsx: "Excel",
};

// ── Row Actions ───────────────────────────────────────────────────────────────

function ReportRowActions({
  report,
  onEdit,
}: {
  report: ScheduledReport;
  onEdit: (r: ScheduledReport) => void;
}) {
  const deleteReport = useDeleteScheduledReport();

  const handleDelete = async () => {
    if (!confirm(`Deletar "${report.name}"?`)) return;
    await deleteReport.mutateAsync(report.id);
    toast.success("Relatório removido.");
  };

  return (
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
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AgendadosPage() {
  const { data: reports = [], isLoading } = useScheduledReports();
  const toggleActive = useToggleReportActive();

  const [createOpen, setCreateOpen] = useState(false);
  const [editReport, setEditReport] = useState<ScheduledReport | null>(null);

  const handleToggle = async (report: ScheduledReport) => {
    await toggleActive.mutateAsync({ id: report.id, isActive: !report.is_active });
    toast.success(report.is_active ? "Relatório pausado." : "Relatório ativado.");
  };

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

        {/* KPI strip */}
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

        {/* Table */}
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        ) : reports.length === 0 ? (
          <EmptyState
            title="Nenhum relatório agendado"
            description="Configure envios automáticos para manter sua equipe informada."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Próximo Envio</TableHead>
                  <TableHead>Último Envio</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
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
                        onCheckedChange={() => handleToggle(report)}
                      />
                    </TableCell>
                    <TableCell>
                      <ReportRowActions report={report} onEdit={setEditReport} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      </div>
    </RequireRole>
  );
}
