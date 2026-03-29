"use client";

import { useMemo } from "react";
import {
  IconFolders,
  IconPlayerPlay,
  IconCircleCheck,
  IconEye,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface QuadroGeralOverviewProps {
  projects: Project[];
}

export function QuadroGeralOverview({ projects }: QuadroGeralOverviewProps) {
  const stats = useMemo(() => {
    const total = projects.length;
    const emAndamento = projects.filter((p) => p.status === "em_andamento").length;
    const emRevisao = projects.filter((p) => p.status === "em_revisao").length;
    const concluido = projects.filter((p) => p.status === "concluido").length;

    const now = new Date();
    const atrasados = projects.filter((p) => {
      if (p.status === "concluido") return false;
      if (!p.due_date_end) return false;
      return new Date(p.due_date_end) < now;
    }).length;

    const completionRate = total > 0 ? Math.round((concluido / total) * 100) : 0;

    return { total, emAndamento, emRevisao, concluido, atrasados, completionRate };
  }, [projects]);

  const items = [
    { label: "Total", value: stats.total, icon: IconFolders },
    { label: "Em andamento", value: stats.emAndamento, icon: IconPlayerPlay },
    { label: "Concluídos", value: stats.concluido, icon: IconCircleCheck, sub: `${stats.completionRate}%` },
    { label: "Em revisão", value: stats.emRevisao, icon: IconEye },
    { label: "Atrasados", value: stats.atrasados, icon: IconAlertTriangle, alert: stats.atrasados > 0 },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-card px-4 py-3",
              item.alert && "border-destructive/20",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0 stroke-[1.5]",
                item.alert ? "text-destructive" : "text-muted-foreground/60",
              )}
            />
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium leading-none">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "text-xl font-semibold tabular-nums tracking-tight leading-none",
                    item.alert && "text-destructive",
                  )}
                >
                  {item.value}
                </span>
                {item.sub && (
                  <span className="text-[10px] text-muted-foreground">{item.sub}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
