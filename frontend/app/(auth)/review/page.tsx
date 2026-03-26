"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlus } from "@tabler/icons-react";
import { ReviewKpiCards } from "@/features/review/components/review-kpi-cards";
import { ReviewProjectCard } from "@/features/review/components/review-project-card";
import { ReviewEmptyState } from "@/features/review/components/review-empty-state";
import { ReviewProjectForm } from "@/features/review/components/review-project-form";
import { useReviewProjects } from "@/features/review/hooks/use-review-projects";

function ReviewDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-60 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: projects, isLoading } = useReviewProjects();

  if (isLoading) return <ReviewDashboardSkeleton />;

  const list = projects ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Creative Review</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o fluxo de aprovação de renders e materiais visuais
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* KPI Cards */}
      {list.length > 0 && <ReviewKpiCards projects={list} />}

      {/* Project Grid / Empty State */}
      {list.length === 0 ? (
        <ReviewEmptyState onCreateProject={() => setFormOpen(true)} />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <ReviewProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ReviewProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
