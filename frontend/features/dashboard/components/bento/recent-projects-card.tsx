"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const STATUS_COLORS: Record<string, string> = {
  em_andamento: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  planejamento: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300",
  revisao: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  concluido: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em andamento",
  planejamento: "Planejamento",
  revisao: "Revisão",
  concluido: "Concluído",
};

function getProjectInitials(name: string): string {
  return name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const PROJECT_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500",
  "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

interface RecentProjectsCardProps {
  projects: ProjectRow[];
}

export function RecentProjectsCard({ projects }: RecentProjectsCardProps) {
  const active = projects
    .filter((p) => !["concluido", "cancelado"].includes(p.status ?? ""))
    .slice(0, 6);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Projetos Recentes</p>
        <Link
          href="/projetos"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos <IconArrowRight className="size-3" />
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Nenhum projeto ativo
        </div>
      ) : (
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {active.map((project, idx) => (
            <Link
              key={project.id}
              href={`/projetos/${project.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback
                  className={`text-[10px] font-bold text-white ${PROJECT_COLORS[idx % PROJECT_COLORS.length]}`}
                >
                  {getProjectInitials(project.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{project.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {project.construtora ?? "Sem cliente"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={`text-[10px] shrink-0 ${STATUS_COLORS[project.status ?? ""] ?? ""}`}
              >
                {STATUS_LABELS[project.status ?? ""] ?? project.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
