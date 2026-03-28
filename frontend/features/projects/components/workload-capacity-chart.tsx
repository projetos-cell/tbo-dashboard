"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconUsers, IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const CAPACITY_HOURS_PER_WEEK = 40;

interface MemberWorkload {
  userId: string;
  name: string;
  estimatedHours: number;
  loggedHours: number;
  capacity: number;
  utilizationPercent: number;
  status: "under" | "normal" | "warning" | "over";
}

function getBarColor(status: MemberWorkload["status"]): string {
  switch (status) {
    case "under": return "#22c55e";
    case "normal": return "#3b82f6";
    case "warning": return "#f59e0b";
    case "over": return "#ef4444";
  }
}

function getStatus(hours: number, capacity: number): MemberWorkload["status"] {
  const ratio = hours / capacity;
  if (ratio < 0.5) return "under";
  if (ratio <= 0.85) return "normal";
  if (ratio <= 1.0) return "warning";
  return "over";
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: MemberWorkload }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2.5 shadow-md text-xs">
      <p className="font-semibold mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Estimado:</span>
          <span className="font-medium">{data.estimatedHours.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Registrado:</span>
          <span className="font-medium">{data.loggedHours.toFixed(1)}h</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Capacidade:</span>
          <span className="font-medium">{data.capacity}h</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Utilização:</span>
          <span
            className={`font-bold ${
              data.status === "over"
                ? "text-red-500"
                : data.status === "warning"
                ? "text-amber-500"
                : "text-green-500"
            }`}
          >
            {data.utilizationPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};

interface WorkloadCapacityChartProps {
  projectId: string;
  capacityHours?: number;
}

export function WorkloadCapacityChart({
  projectId,
  capacityHours = CAPACITY_HOURS_PER_WEEK,
}: WorkloadCapacityChartProps) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data: workloadData, isLoading } = useQuery({
    queryKey: ["workload-capacity", projectId, tenantId],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from("os_tasks")
        .select("assignee_id,assignee_name,estimated_hours,logged_hours,is_completed")
        .eq("project_id", projectId)
        .not("assignee_id", "is", null);

      if (error) throw error;
      return tasks ?? [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });

  const memberWorkloads: MemberWorkload[] = useMemo(() => {
    if (!workloadData) return [];

    const memberMap = new Map<string, {
      name: string;
      estimatedHours: number;
      loggedHours: number;
    }>();

    for (const task of workloadData) {
      if (!task.assignee_id) continue;
      const existing = memberMap.get(task.assignee_id) ?? {
        name: task.assignee_name ?? task.assignee_id,
        estimatedHours: 0,
        loggedHours: 0,
      };
      existing.estimatedHours += (task.estimated_hours as number | null) ?? 0;
      existing.loggedHours += (task.logged_hours as number | null) ?? 0;
      memberMap.set(task.assignee_id, existing);
    }

    return Array.from(memberMap.entries())
      .map(([userId, data]) => {
        const hours = Math.max(data.estimatedHours, data.loggedHours);
        const status = getStatus(hours, capacityHours);
        return {
          userId,
          name: data.name.split(" ")[0], // First name only for chart
          estimatedHours: data.estimatedHours,
          loggedHours: data.loggedHours,
          capacity: capacityHours,
          utilizationPercent: Math.round((hours / capacityHours) * 100),
          status,
        };
      })
      .sort((a, b) => b.estimatedHours - a.estimatedHours);
  }, [workloadData, capacityHours]);

  const overloaded = memberWorkloads.filter((m) => m.status === "over").length;
  const atRisk = memberWorkloads.filter((m) => m.status === "warning").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (memberWorkloads.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <IconUsers size={16} className="text-muted-foreground" />
            Carga de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-xs text-muted-foreground">Nenhuma tarefa atribuída</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUsers size={16} className="text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Carga vs Capacidade</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {overloaded > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                {overloaded} sobrecarregado(s)
              </Badge>
            )}
            {atRisk > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                {atRisk} no limite
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <IconInfoCircle size={11} />
          Capacidade base: {capacityHours}h/semana por pessoa
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(160, memberWorkloads.length * 36)}>
          <BarChart
            data={memberWorkloads}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
              domain={[0, Math.max(capacityHours * 1.3, ...memberWorkloads.map((m) => m.estimatedHours + 4))]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <ReferenceLine
              x={capacityHours}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{
                value: `${capacityHours}h`,
                position: "top",
                fontSize: 9,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <Bar dataKey="estimatedHours" radius={[0, 3, 3, 0]} maxBarSize={20}>
              {memberWorkloads.map((entry) => (
                <Cell key={entry.userId} fill={getBarColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Abaixo da capacidade
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            Normal
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            No limite
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Sobrecarregado
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
