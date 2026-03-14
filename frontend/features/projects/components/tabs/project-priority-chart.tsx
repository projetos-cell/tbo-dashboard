"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TASK_PRIORITY, type TaskPriorityKey } from "@/lib/constants";
import type { ProjectTaskStats } from "@/features/projects/services/project-tasks";

interface ProjectPriorityChartProps {
  stats?: ProjectTaskStats | null;
  loading?: boolean;
}

export function ProjectPriorityChart({ stats, loading }: ProjectPriorityChartProps) {
  const data = useMemo(() => {
    if (!stats?.byPriority) return [];
    return Object.entries(stats.byPriority)
      .filter(([key]) => key !== "sem_prioridade")
      .map(([key, count]) => {
        const config = TASK_PRIORITY[key as TaskPriorityKey];
        return {
          name: config?.label ?? key,
          value: count,
          color: config?.color ?? "#6b7280",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [stats?.byPriority]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Distribuição por Prioridade</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Distribuição por Prioridade</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tarefas`, ""]} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
