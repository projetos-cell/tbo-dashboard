"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS, BU_COLORS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface Props {
  projects: ProjectRow[];
}

export function ActiveProjects({ projects }: Props) {
  const active = projects
    .filter((p) => !["finalizado", "cancelado"].includes(p.status ?? ""))
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Projetos Ativos ({active.length})
        </CardTitle>
        <Link
          href="/projetos"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum projeto ativo
          </p>
        ) : (
          <div className="space-y-2">
            {active.map((project) => {
              const statusCfg =
                PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS];
              const progress = (project as Record<string, unknown>).progress as number ?? 0;
              const buList = Array.isArray(project.bus)
                ? project.bus
                : project.bus
                  ? [project.bus]
                  : [];

              return (
                <Link
                  key={project.id}
                  href={`/projetos/${project.id}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {project.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {statusCfg && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </Badge>
                      )}
                      {buList.slice(0, 2).map((bu) => {
                        const buColor = BU_COLORS[bu];
                        return (
                          <Badge
                            key={bu}
                            variant="outline"
                            className="text-xs"
                            style={
                              buColor
                                ? {
                                    backgroundColor: buColor.bg,
                                    color: buColor.color,
                                    borderColor: buColor.bg,
                                  }
                                : undefined
                            }
                          >
                            {bu}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="ml-3 w-20">
                    <Progress value={progress} className="h-1.5" />
                    <p className="mt-0.5 text-right text-xs text-muted-foreground">
                      {progress}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
