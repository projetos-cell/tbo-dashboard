"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, BU_COLORS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectsOverview({ projects }: { projects: ProjectRow[] }) {
  const active = projects
    .filter((p) => !["finalizado", "cancelado"].includes(p.status ?? ""))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Projetos Ativos</CardTitle>
        <Link href="/projetos" className="text-sm text-muted-foreground hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum projeto ativo
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((project) => {
              const statusCfg =
                PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS];
              const buList = Array.isArray(project.bus)
                ? project.bus
                : project.bus
                  ? [project.bus]
                  : [];

              return (
                <Link
                  key={project.id}
                  href={`/projetos/${project.id}`}
                  className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="font-medium leading-tight">{project.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                    {buList.map((bu) => {
                      const buColor = BU_COLORS[bu];
                      return (
                        <Badge
                          key={bu}
                          variant="outline"
                          className="text-xs"
                          style={
                            buColor
                              ? { backgroundColor: buColor.bg, color: buColor.color, borderColor: buColor.bg }
                              : undefined
                          }
                        >
                          {bu}
                        </Badge>
                      );
                    })}
                  </div>
                  {project.construtora && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {project.construtora}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
