"use client";

import { useProject } from "@/features/projects/hooks/use-projects";

/**
 * Resolves a UUID breadcrumb segment to a human-readable label.
 * Currently supports: projetos/<uuid> -> project.name
 */
export function useBreadcrumbLabel(
  uuid: string,
  parentSegment?: string,
): string | null {
  const isProject = parentSegment === "projetos";
  // useProject returns empty when id is "" (enabled: !!id internally)
  const { data: project } = useProject(isProject ? uuid : "");

  if (isProject && project?.name) {
    return project.name;
  }

  return null;
}
