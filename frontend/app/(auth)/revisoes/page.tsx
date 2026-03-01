"use client";

import Link from "next/link";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  FileCheck,
  XCircle,
} from "lucide-react";
import {
  usePendingReviews,
  useInProgressReviews,
  useCompletedReviews,
  useReviewKpis,
} from "@/hooks/use-revisoes";
import { ErrorState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_revisao: { label: "Em Revisao", variant: "default" },
  aprovado: { label: "Aprovado", variant: "default" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  entregue: { label: "Entregue", variant: "outline" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ClipboardCheck className="mb-3 h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function DeliverableTable({
  items,
  isLoading,
  emptyMessage,
  columns,
}: {
  items: DeliverableRow[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  columns: { header: string; accessor: (row: DeliverableRow) => React.ReactNode }[];
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.header}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <EmptyTabState message={emptyMessage} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.header}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col.header}>{col.accessor(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RevisoesContent() {
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useReviewKpis();
  const pending = usePendingReviews();
  const inProgress = useInProgressReviews();
  const completed = useCompletedReviews();

  const primaryError = kpisError || pending.error || inProgress.error || completed.error;
  const primaryRefetch = () => {
    refetchKpis();
    pending.refetch();
    inProgress.refetch();
    completed.refetch();
  };

  const kpiCards = [
    {
      title: "Pendentes",
      value: kpisLoading ? "--" : String(kpis?.pendentes ?? 0),
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Em Revisao",
      value: kpisLoading ? "--" : String(kpis?.emRevisao ?? 0),
      icon: Loader2,
      color: "text-blue-500",
    },
    {
      title: "Aprovadas",
      value: kpisLoading ? "--" : String(kpis?.aprovadas ?? 0),
      icon: CheckCircle2,
      color: "text-green-500",
    },
  ];

  const pendingCols = [
    { header: "Entrega", accessor: (r: DeliverableRow) => r.title ?? r.name },
    { header: "Projeto", accessor: (r: DeliverableRow) => r.project_name ?? "--" },
    { header: "Responsavel", accessor: (r: DeliverableRow) => r.owner_name ?? "--" },
    { header: "Data", accessor: (r: DeliverableRow) => formatDate(r.created_at) },
    {
      header: "Status",
      accessor: (r: DeliverableRow) => {
        const cfg = STATUS_BADGE[r.status] ?? { label: r.status, variant: "outline" as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];

  const inProgressCols = [
    { header: "Entrega", accessor: (r: DeliverableRow) => r.title ?? r.name },
    { header: "Projeto", accessor: (r: DeliverableRow) => r.project_name ?? "--" },
    { header: "Revisor", accessor: (r: DeliverableRow) => r.reviewer_id ?? "--" },
    { header: "Inicio", accessor: (r: DeliverableRow) => formatDate(r.updated_at) },
    {
      header: "Status",
      accessor: (r: DeliverableRow) => (
        <Badge variant="default">Em Revisao</Badge>
      ),
    },
  ];

  const completedCols = [
    { header: "Entrega", accessor: (r: DeliverableRow) => r.title ?? r.name },
    { header: "Projeto", accessor: (r: DeliverableRow) => r.project_name ?? "--" },
    { header: "Aprovador", accessor: (r: DeliverableRow) => r.reviewer_id ?? "--" },
    { header: "Data Conclusao", accessor: (r: DeliverableRow) => formatDate(r.updated_at) },
    {
      header: "Resultado",
      accessor: (r: DeliverableRow) => {
        const cfg = STATUS_BADGE[r.status] ?? { label: r.status, variant: "outline" as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Revisoes & Aprovacoes
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe revisoes pendentes e aprovacoes de entregas.
        </p>
      </div>

      {primaryError && (
        <ErrorState message={primaryError.message} onRetry={primaryRefetch} />
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpisLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    kpi.value
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Pendentes
            {pending.data && pending.data.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {pending.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="andamento">
            <Loader2 className="mr-1.5 h-3.5 w-3.5" />
            Em Andamento
            {inProgress.data && inProgress.data.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {inProgress.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="concluidas">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Concluidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <DeliverableTable
                items={pending.data}
                isLoading={pending.isLoading}
                emptyMessage="Nenhuma revisao pendente no momento."
                columns={pendingCols}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="andamento" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <DeliverableTable
                items={inProgress.data}
                isLoading={inProgress.isLoading}
                emptyMessage="Nenhuma revisao em andamento."
                columns={inProgressCols}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <DeliverableTable
                items={completed.data}
                isLoading={completed.isLoading}
                emptyMessage="Nenhuma revisao concluida."
                columns={completedCols}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Note */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <FileCheck className="h-8 w-8 shrink-0 text-muted-foreground/60" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              O modulo de revisoes esta integrado com as Entregas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acesse Entregas para gerenciar revisoes e aprovacoes de forma
              completa.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/entregas">
              Ir para Entregas
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RevisoesPage() {
  return (
    <RequireRole module="revisoes">
      <RevisoesContent />
    </RequireRole>
  );
}
