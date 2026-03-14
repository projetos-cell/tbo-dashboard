"use client";

import { useRouter } from "next/navigation";
import { IconCalendar, IconUser, IconExternalLink } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, BU_COLORS, type ProjectStatusKey } from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/projetos/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {project.code && (
              <span className="text-muted-foreground mb-0.5 block text-[10px] font-mono uppercase tracking-wider">
                {project.code}
              </span>
            )}
            <CardTitle className="line-clamp-2 text-sm font-medium leading-tight">
              {project.name}
            </CardTitle>
          </div>
          {project.notion_url && (
            <a
              href={project.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Status badge */}
        {status && (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </Badge>
        )}

        {/* BU tags */}
        {busList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {busList.map((bu) => {
              const buColor = BU_COLORS[bu];
              return (
                <Badge
                  key={bu}
                  variant="outline"
                  className="px-1.5 py-0 text-[10px]"
                  style={
                    buColor
                      ? { backgroundColor: buColor.bg, color: buColor.color, borderColor: "transparent" }
                      : undefined
                  }
                >
                  {bu}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Construtora */}
        {project.construtora && (
          <p className="text-muted-foreground truncate text-xs">
            {project.construtora}
          </p>
        )}

        {/* Footer: owner + date */}
        <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
          {project.owner_name && (
            <div className="flex items-center gap-1 truncate">
              <IconUser className="h-3 w-3 shrink-0" />
              <span className="truncate">{project.owner_name}</span>
            </div>
          )}
          {project.due_date_end && (
            <div className="flex shrink-0 items-center gap-1">
              <IconCalendar className="h-3 w-3" />
              <span>
                {format(new Date(project.due_date_end), "dd MMM", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
