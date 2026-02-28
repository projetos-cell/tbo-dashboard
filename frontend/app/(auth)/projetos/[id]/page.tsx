"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectTopbar } from "@/components/projects/project-topbar";
import { ProjectOverview } from "@/components/projects/tabs/project-overview";
import { ProjectGantt } from "@/components/projects/tabs/project-gantt";
import { ProjectFiles } from "@/components/projects/tabs/project-files";
import { ProjectActivityTab } from "@/components/projects/tabs/project-activity";
import { DemandsList } from "@/components/demands/demands-list";
import { DemandsBoard } from "@/components/demands/demands-board";
import { DemandDetail } from "@/components/demands/demand-detail";
import {
  DemandsToolbar,
  applyDemandsFilters,
  type DemandsFilters,
} from "@/components/demands/demands-toolbar";
import { useProject, useProjectDemands, useProjectStats } from "@/hooks/use-projects";
import { useProfiles } from "@/hooks/use-people";
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
  const { data: project, isLoading, error } = useProject(id);
  const { data: stats, isLoading: statsLoading } = useProjectStats(id);
  const { data: profiles } = useProfiles();
  const { data: demands } = useProjectDemands(id);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDemand, setSelectedDemand] = useState<DemandRow | null>(null);

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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Projeto nao encontrado
        </p>
        <Link href="/projetos">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
      </div>
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
            <div className="text-sm text-muted-foreground text-center py-8">
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
            <div className="text-sm text-muted-foreground text-center py-8">
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
