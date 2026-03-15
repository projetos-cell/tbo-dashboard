"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectTaskStats } from "@/features/projects/services/project-tasks";

interface ProjectCompletionRingProps {
  stats?: ProjectTaskStats | null;
  loading?: boolean;
}

export function ProjectCompletionRing({ stats, loading }: ProjectCompletionRingProps) {
  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completedTasks ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-36 w-36 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const data = [{ name: "Progresso", value: pct, fill: "#22c55e" }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto h-40 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={data}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "hsl(var(--muted))" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{pct}%</span>
            <span className="text-muted-foreground text-xs">
              {completed}/{total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
