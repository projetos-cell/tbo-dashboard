"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
import type { ProjectTaskStats } from "@/features/projects/services/project-tasks";

interface ProjectStatusChartProps {
  stats?: ProjectTaskStats | null;
  loading?: boolean;
}

export function ProjectStatusChart({ stats, loading }: ProjectStatusChartProps) {
  const data = useMemo(() => {
    if (!stats?.byStatus) return [];
    return Object.entries(stats.byStatus)
      .map(([key, count]) => {
        const config = TASK_STATUS[key as TaskStatusKey];
        return {
          name: config?.label ?? key,
          value: count,
          color: config?.color ?? "#6b7280",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [stats?.byStatus]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tarefas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tarefas por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value} tarefas`, ""]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
