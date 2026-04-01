"use client";

import { useMemo } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface BUOverviewCardProps {
  buName: string;
  projects: Project[];
  onClick: () => void;
  index: number;
}

export function BUOverviewCard({ buName, projects, onClick }: BUOverviewCardProps) {
  const stats = useMemo(() => {
    const total = projects.length;
    const concluido = projects.filter((p) => p.status === "concluido").length;
    const ativos = projects.filter((p) => !["concluido", "cancelado"].includes(p.status ?? "")).length;
    const completionRate = total > 0 ? Math.round((concluido / total) * 100) : 0;

    const now = new Date();
    const atrasados = projects.filter((p) => {
      if (p.status === "concluido") return false;
      if (!p.due_date_end) return false;
      return new Date(p.due_date_end) < now;
    }).length;

    return { total, ativos, concluido, completionRate, atrasados };
  }, [projects]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-lg border bg-card px-5 py-4 text-left transition-all",
        "hover:bg-muted/40",
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold tracking-tight">{buName}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground tabular-nums">
          <span className="whitespace-nowrap">
            <span className="font-medium text-foreground/80">{stats.ativos}</span>
            {" "}
            <span className="text-muted-foreground/60">ativos</span>
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="whitespace-nowrap">
            <span className="font-medium text-emerald-600">{stats.concluido}</span>
            {" "}
            <span className="text-muted-foreground/60">concluídos</span>
          </span>
          {stats.atrasados > 0 && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="whitespace-nowrap">
                <span className="text-destructive font-medium">{stats.atrasados}</span>
                {" "}
                <span className="text-muted-foreground/60">atrasado{stats.atrasados !== 1 ? "s" : ""}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <IconArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 transition-all group-hover:text-foreground group-hover:translate-x-0.5" />
    </button>
  );
}
