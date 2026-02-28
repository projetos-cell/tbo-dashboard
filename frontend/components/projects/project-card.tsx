"use client";

import Link from "next/link";
import { Calendar, User, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, BU_COLORS, type ProjectStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
}

function parseBus(raw: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = PROJECT_STATUS[project.status as ProjectStatusKey];
  const busList = parseBus(project.bus);

  return (
    <Link href={`/projetos/${project.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
              {project.name}
            </CardTitle>
            {project.notion_url && (
              <a
                href={project.notion_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
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
                    className="text-[10px] px-1.5 py-0"
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
            <p className="text-xs text-muted-foreground truncate">
              {project.construtora}
            </p>
          )}

          {/* Footer: owner + date */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            {project.owner_name && (
              <div className="flex items-center gap-1 truncate">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{project.owner_name}</span>
              </div>
            )}
            {project.due_date_end && (
              <div className="flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3" />
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
    </Link>
  );
}
