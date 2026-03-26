"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectEditor } from "@/features/website-admin/components/project-editor";
import { useWebsiteProject } from "@/features/website-admin/hooks/use-website-projects";

export default function EditWebsiteProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading } = useWebsiteProject(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold mb-1">Projeto não encontrado</h2>
        <p className="text-sm text-muted-foreground">
          O projeto pode ter sido excluído ou o link está incorreto.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ProjectEditor project={project} mode="edit" />
    </div>
  );
}
