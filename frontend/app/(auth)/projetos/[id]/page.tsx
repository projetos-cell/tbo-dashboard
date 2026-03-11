"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";
import { ProjectTopbar } from "@/features/projects/components/project-topbar";
import { ProjectOverview } from "@/features/projects/components/tabs/project-overview";
import { ProjectFiles } from "@/features/projects/components/tabs/project-files";
import { ProjectActivityTab } from "@/features/projects/components/tabs/project-activity";

// Heavy: frappe-gantt library — lazy load with SSR disabled
const ProjectGantt = dynamic(
  () => import("@/features/projects/components/tabs/project-gantt").then((m) => ({ default: m.ProjectGantt })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-100" />,
  }
);
import { DemandsList } from "@/features/demands/components/demands-list";
import { DemandsBoard } from "@/features/demands/components/demands-board";
import { DemandDetail } from "@/features/demands/components/demand-detail";
import {
  DemandsToolbar,
  applyDemandsFilters,
  type DemandsFilters,
} from "@/features/demands/components/demands-toolbar";
import { useProject, useProjectDemands, useProjectStats } from "@/features/projects/hooks/use-projects";
import { useProfiles } from "@/features/people/hooks/use-people";
import { useUser } from "@/hooks/use-user";
import type { UserOption } from "@/components/ui/user-selector";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  useUser();
  const { data: project, isLoading, error, refetch } = useProject(id);
  const { data: stats, isLoading: statsLoading } = useProjectStats(id);
  const { data: profiles } = useProfiles();
  const { data: demands } = useProjectDemands(id);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDemand, setSelectedDemand] = useState<DemandRow | null>(null);

  // Deep-link: ?demanda=<id> opens drawer automatically
  useEffect(() => {
    const demandId = searchParams.get("demanda");
    if (demandId && demands && demands.length > 0) {
      const target = demands.find((d) => d.id === demandId);
      if (target) {
        setSelectedDemand(target);
        if (activeTab === "overview") setActiveTab("list");
      }
    }
  }, [searchParams, demands]); // eslint-disable-line react-hooks/exhaustive-deps

  // Demand filters & sorting
  const [filters, setFilters] = useState<DemandsFilters>({
    statuses: [],
    priorities: [],
    bus: [],
    search: "",
  });
  const [sortField, setSortField] = useState<"title" | "due_date" | "prioridade" | "status" | "created_at">("due_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const allDemands = demands || [];
  const filteredDemands = applyDemandsFilters(
    allDemands,
    filters,
    sortField,
    sortDir
  );

  const users: UserOption[] = (profiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    email: p.email,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <ErrorState
        message={error?.message || "Projeto não encontrado"}
        onRetry={() => refetch()}
      />
    );
  }

  const showToolbar = activeTab === "list" || activeTab === "board";

  return (
    <div className="space-y-6">
      <ProjectTopbar project={project} users={users} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Toolbar shown for list & board tabs */}
        {showToolbar && (
          <div className="mt-3">
            <DemandsToolbar
              demands={allDemands}
              filters={filters}
              onFiltersChange={setFilters}
              sortField={sortField}
              sortDir={sortDir}
              onSortChange={(field, dir) => {
                setSortField(field);
                setSortDir(dir);
              }}
              filteredCount={filteredDemands.length}
            />
          </div>
        )}

        <TabsContent value="overview">
          <ProjectOverview
            projectId={id}
            stats={stats}
            statsLoading={statsLoading}
          />
        </TabsContent>

        <TabsContent value="list">
          {filteredDemands.length > 0 ? (
            <DemandsList
              demands={filteredDemands}
              onSelect={(d) => setSelectedDemand(d)}
            />
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              {allDemands.length === 0
                ? "Nenhuma demanda neste projeto."
                : "Nenhuma demanda encontrada com os filtros aplicados."}
            </div>
          )}
        </TabsContent>

        <TabsContent value="board">
          {allDemands.length > 0 ? (
            <DemandsBoard
              demands={filteredDemands}
              onSelect={(d) => setSelectedDemand(d)}
            />
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              Nenhuma demanda neste projeto.
            </div>
          )}
        </TabsContent>

        <TabsContent value="gantt">
          <ProjectGantt projectId={id} />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFiles projectId={id} />
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivityTab projectId={id} />
        </TabsContent>
      </Tabs>

      <DemandDetail
        demand={selectedDemand}
        open={!!selectedDemand}
        onOpenChange={(open) => {
          if (!open) setSelectedDemand(null);
        }}
      />
    </div>
  );
}
