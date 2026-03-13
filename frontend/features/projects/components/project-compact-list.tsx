"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendar, IconExternalLink } from "@tabler/icons-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface ProjectCompactListProps {
  projects: Project[];
}

export function ProjectCompactList({ projects }: ProjectCompactListProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        Nenhum projeto encontrado
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const status = PROJECT_STATUS[project.status as ProjectStatusKey];

        return (
          <div
            key={project.id}
            onClick={() => router.push(`/projetos/${project.id}`)}
            className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
          >
            {/* Status indicator */}
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: status?.color ?? "#6b7280" }}
            />

            {/* Name + construtora */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.name}</p>
              {project.construtora && (
                <p className="truncate text-xs text-gray-500">
                  {project.construtora}
                </p>
              )}
            </div>

            {/* Status badge */}
            {status && (
              <Badge
                variant="secondary"
                className="hidden h-5 shrink-0 text-[10px] sm:inline-flex"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </Badge>
            )}

            {/* Owner avatar */}
            {project.owner_name && (
              <div
                className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600 md:flex"
                title={project.owner_name}
              >
                {getInitials(project.owner_name)}
              </div>
            )}

            {/* Due date */}
            {project.due_date_end && (
              <div className="hidden shrink-0 items-center gap-1 text-xs text-gray-500 lg:flex">
                <IconCalendar className="h-3 w-3" />
                <span>
                  {format(new Date(project.due_date_end), "dd MMM", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}

            {/* Notion link */}
            {project.notion_url && (
              <a
                href={project.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-gray-400 hover:text-gray-700"
              >
                <IconExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
