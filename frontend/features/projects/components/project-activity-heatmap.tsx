"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconActivityHeartbeat } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_COLORS = [
  "bg-muted/40",
  "bg-green-200",
  "bg-green-400",
  "bg-green-600",
  "bg-green-800",
];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function generateLast52Weeks(): string[] {
  const days: string[] = [];
  const now = new Date();
  // Align to Sunday
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (max === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

interface ProjectActivityHeatmapProps {
  projectId: string;
}

export function ProjectActivityHeatmap({ projectId }: ProjectActivityHeatmapProps) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data: activityData, isLoading } = useQuery({
    queryKey: ["project-activity-heatmap", projectId, tenantId],
    queryFn: async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await supabase
        .from("os_tasks")
        .select("completed_at,created_at,updated_at")
        .eq("project_id", projectId)
        .gte("updated_at", oneYearAgo.toISOString());

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!projectId && !!tenantId,
  });

  const { heatmapData, weeks, maxCount } = useMemo(() => {
    const allDays = generateLast52Weeks();
    const countMap: Record<string, number> = {};

    for (const task of activityData ?? []) {
      // Count by updated_at date
      const date = (task.updated_at ?? task.created_at ?? "").split("T")[0];
      if (date && allDays.includes(date)) {
        countMap[date] = (countMap[date] ?? 0) + 1;
      }
      // Also count completion date
      if (task.completed_at) {
        const compDate = task.completed_at.split("T")[0];
        if (allDays.includes(compDate)) {
          countMap[compDate] = (countMap[compDate] ?? 0) + 1;
        }
      }
    }

    const max = Math.max(0, ...Object.values(countMap));

    const days: HeatmapDay[] = allDays.map((date) => ({
      date,
      count: countMap[date] ?? 0,
      level: getLevel(countMap[date] ?? 0, max),
    }));

    // Group into weeks (7-day columns)
    const weeksArr: HeatmapDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArr.push(days.slice(i, i + 7));
    }

    return { heatmapData: days, weeks: weeksArr, maxCount: max };
  }, [activityData]);

  // Month labels positioning
  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, idx) => {
      const firstDay = new Date(week[0]?.date ?? "");
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTH_LABELS[month], weekIdx: idx });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const totalActivity = heatmapData.reduce((s, d) => s + d.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconActivityHeartbeat size={16} className="text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Atividade do Projeto</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalActivity} atividades no último ano
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="relative mb-1 flex" style={{ paddingLeft: 28 }}>
            {monthLabels.map(({ label, weekIdx }) => (
              <div
                key={`${label}-${weekIdx}`}
                className="absolute text-[9px] text-muted-foreground"
                style={{ left: 28 + weekIdx * 14 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5" style={{ paddingLeft: 28 }}>
            {/* Day labels */}
            <div className="absolute flex flex-col gap-0.5">
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className="text-[9px] text-muted-foreground"
                  style={{
                    height: 12,
                    lineHeight: "12px",
                    visibility: i % 2 === 0 ? "visible" : "hidden",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <TooltipProvider>
              <div className="flex gap-0.5 mt-5">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-0.5">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-3 w-3 rounded-[2px] cursor-default transition-colors ${LEVEL_COLORS[day.level]}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-2">
                          <p className="text-xs font-medium">
                            {day.count} atividade{day.count !== 1 ? "s" : ""}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-1.5 justify-end">
            <span className="text-[10px] text-muted-foreground">Menos</span>
            {LEVEL_COLORS.map((color, i) => (
              <div key={i} className={`h-3 w-3 rounded-[2px] ${color}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">Mais</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
