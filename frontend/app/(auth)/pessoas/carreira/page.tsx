"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RBACGuard } from "@/components/rbac-guard";
import { useCareerPaths } from "@/features/career-paths/hooks/use-career-paths";
import { CareerPathGrid } from "@/features/career-paths/components/career-path-grid";
import { CareerKPIs } from "@/features/career-paths/components/career-kpis";

export default function CarreiraPage() {
  const { data: paths, isLoading, isError, refetch } = useCareerPaths();

  return (
    <RBACGuard minRole="colaborador">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trilhas de Carreira</h1>
          <p className="text-muted-foreground">
            Explore os 6 núcleos e suas trilhas de crescimento — gestão e técnica.
          </p>
        </div>

        {/* Error state */}
        {isError && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Erro ao carregar trilhas de carreira
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* KPIs */}
        <CareerKPIs paths={paths ?? []} isLoading={isLoading} />

        {/* Grid dos 6 núcleos */}
        <CareerPathGrid paths={paths ?? []} isLoading={isLoading} />
      </div>
    </RBACGuard>
  );
}
