"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconChartBar,
  IconRefresh,
  IconShare,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useBIDashboard,
  useBIWidgets,
  useUpdateBIDashboard,
} from "@/features/relatorios/hooks/use-reports";
import { BiDashboardBuilder } from "@/features/relatorios/components/bi-dashboard-builder";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { exportToPDF } from "@/lib/export-utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BIDashboardViewPage({ params }: PageProps) {
  const { id } = use(params);
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const { data: dashboard, isLoading } = useBIDashboard(id);
  const { data: widgets = [] } = useBIWidgets(id);
  const updateDashboard = useUpdateBIDashboard();

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ["bi-widgets", tenantId, id] });
    qc.invalidateQueries({ queryKey: ["widget-data", tenantId] });
    toast.success("Dashboard atualizado.");
  };

  const handleShare = async () => {
    if (!dashboard) return;
    await updateDashboard.mutateAsync({
      id,
      updates: { is_shared: !dashboard.is_shared },
    });
    toast.success(
      dashboard.is_shared ? "Dashboard privado." : "Dashboard compartilhado."
    );
  };

  const handleExportPDF = () => {
    if (!dashboard) return;
    exportToPDF(
      dashboard.name,
      widgets.map((w) => ({
        widget: w.title,
        tipo: w.widget_type,
        fonte: w.data_source,
      })),
      [
        { key: "widget", label: "Widget" },
        { key: "tipo", label: "Tipo" },
        { key: "fonte", label: "Fonte de Dados" },
      ]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Dashboard não encontrado.
      </div>
    );
  }

  return (
    <RequireRole module="relatorios" minRole="lider">
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
              <BreadcrumbLink asChild>
                <Link href="/relatorios/bi">BI Dashboards</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{dashboard.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconChartBar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{dashboard.name}</h1>
                {dashboard.is_shared && (
                  <Badge variant="secondary">Compartilhado</Badge>
                )}
              </div>
              {dashboard.description && (
                <p className="text-sm text-muted-foreground">{dashboard.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <IconRefresh className="mr-1.5 h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={updateDashboard.isPending}
            >
              {updateDashboard.isPending ? (
                <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <IconShare className="mr-1.5 h-4 w-4" />
              )}
              {dashboard.is_shared ? "Tornar Privado" : "Compartilhar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              Exportar PDF
            </Button>
          </div>
        </div>

        <BiDashboardBuilder dashboard={dashboard} />
      </div>
    </RequireRole>
  );
}
