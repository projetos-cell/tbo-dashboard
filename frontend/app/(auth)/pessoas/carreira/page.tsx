"use client";

import { useCareerPaths } from "@/features/career-paths/hooks/use-career-paths";
import { CareerPathGrid } from "@/features/career-paths/components/career-path-grid";
import { CareerKPIs } from "@/features/career-paths/components/career-kpis";

export default function CarreiraPage() {
  const { data: paths, isLoading } = useCareerPaths();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trilhas de Carreira</h1>
        <p className="text-muted-foreground">
          Explore os 6 núcleos e suas trilhas de crescimento — gestão e técnica.
        </p>
      </div>

      {/* KPIs */}
      <CareerKPIs paths={paths ?? []} isLoading={isLoading} />

      {/* Grid dos 6 núcleos */}
      <CareerPathGrid paths={paths ?? []} isLoading={isLoading} />
    </div>
  );
}
