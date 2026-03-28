"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconFileText,
  IconPlus,
  IconDownload,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useMarketingReports,
  useCreateMarketingReport,
} from "@/features/marketing/hooks/use-marketing-analytics";
import type { MarketingReport } from "@/features/marketing/types/marketing";
import { useAuthStore } from "@/stores/auth-store";

// ─── Constants ─────────────────────────────────────────────────────

const REPORT_TYPE_LABELS: Record<MarketingReport["type"], string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  campanha: "Campanha",
  canal: "Canal",
  custom: "Customizado",
};

const REPORT_TYPE_COLORS: Record<MarketingReport["type"], string> = {
  mensal: "bg-blue-500/10 text-blue-700 border-blue-200",
  trimestral: "bg-purple-500/10 text-purple-700 border-purple-200",
  campanha: "bg-green-500/10 text-green-700 border-green-200",
  canal: "bg-amber-500/10 text-amber-700 border-amber-200",
  custom: "bg-gray-500/10 text-gray-700 border-gray-200",
};

// ─── Create Report Modal — #60 ──────────────────────────────────────

const reportSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  type: z.enum(["mensal", "trimestral", "campanha", "canal", "custom"]),
  period_start: z.string().min(1, "Data inicial obrigatória"),
  period_end: z.string().min(1, "Data final obrigatória"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

function CreateReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: create, isPending } = useCreateMarketingReport();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: "",
      type: "mensal",
      period_start: "",
      period_end: "",
    },
  });

  function onSubmit(values: ReportFormValues) {
    create(
      {
        tenant_id: tenantId ?? "",
        name: values.name,
        type: values.type,
        period_start: values.period_start,
        period_end: values.period_end,
        data: {},
        created_by: userId,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Relatório</DialogTitle>
        </DialogHeader>

        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do relatório</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Relatório Q1 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(REPORT_TYPE_LABELS) as MarketingReport["type"][]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {REPORT_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período: de</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>até</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Generation status hint */}
            {isPending && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <IconLoader2 className="size-3.5 animate-spin" />
                Gerando relatório…
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />
                    Gerando…
                  </>
                ) : (
                  "Gerar Relatório"
                )}
              </Button>
            </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Relatorios Content — #59 ──────────────────────────────────────

function RelatoriosContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: reports, isLoading, error, refetch } = useMarketingReports();

  function downloadReport(report: MarketingReport) {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios de Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Relatórios comparativos e histórico de análises.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <IconPlus className="mr-1 h-4 w-4" /> Gerar Relatório
        </Button>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar relatórios." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={IconFileText}
          title="Nenhum relatório gerado"
          description="Gere seu primeiro relatório de marketing para acompanhar resultados."
          cta={{ label: "Gerar Relatório", onClick: () => setModalOpen(true), icon: IconPlus }}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Relatório</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Período
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Autor
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Criado em
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{report.name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${REPORT_TYPE_COLORS[report.type] ?? ""}`}
                    >
                      {REPORT_TYPE_LABELS[report.type] ?? report.type}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell text-xs">
                    {new Date(report.period_start).toLocaleDateString("pt-BR")} —{" "}
                    {new Date(report.period_end).toLocaleDateString("pt-BR")}
                  </td>
                  {/* Author — #59 */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {report.created_by ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconUser className="size-3.5" />
                        <span>{report.created_by}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell text-xs">
                    {new Date(report.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => downloadReport(report)}
                      title="Baixar relatório"
                    >
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/20 border-t">
              <tr>
                <td colSpan={6} className="px-4 py-2 text-xs text-muted-foreground">
                  {reports.length} {reports.length === 1 ? "relatório" : "relatórios"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Create report modal — #60 */}
      <CreateReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function RelatoriosMarketingPage() {
  return (
    <RequireRole module="marketing" minRole="admin">
      <RelatoriosContent />
    </RequireRole>
  );
}
