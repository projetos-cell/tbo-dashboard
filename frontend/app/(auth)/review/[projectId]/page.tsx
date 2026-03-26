"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IconPencil, IconShare } from "@tabler/icons-react";
import { WorkflowStageIndicator } from "@/features/review/components/workflow-stage-indicator";
import { ReviewSceneGrid } from "@/features/review/components/review-scene-grid";
import { ReviewProjectForm } from "@/features/review/components/review-project-form";
import { ReviewShareDialog } from "@/features/review/components/review-share-dialog";
import { useReviewProject } from "@/features/review/hooks/use-review-projects";
import { useReviewScenes } from "@/features/review/hooks/use-review-scenes";

interface ReviewProjectPageProps {
  params: Promise<{ projectId: string }>;
}

function ProjectPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ReviewProjectPage({ params }: ReviewProjectPageProps) {
  const { projectId } = use(params);
  const [editOpen, setEditOpen] = useState(false);

  const { data: project, isLoading: loadingProject } = useReviewProject(projectId);
  const { data: scenes, isLoading: loadingScenes } = useReviewScenes(projectId);

  if (loadingProject || loadingScenes) return <ProjectPageSkeleton />;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/review">Creative Review</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          {project.client_name && (
            <p className="text-sm text-muted-foreground">{project.client_name}</p>
          )}
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ReviewShareDialog projectId={projectId} />
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <IconPencil className="mr-1.5 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Workflow Stage Indicator */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Estágio do Workflow
        </p>
        <WorkflowStageIndicator currentStage={project.workflow_stage} />
      </div>

      {/* Scene Grid */}
      <ReviewSceneGrid projectId={projectId} scenes={scenes ?? []} />

      {/* Edit Dialog */}
      <ReviewProjectForm
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
    </div>
  );
}
