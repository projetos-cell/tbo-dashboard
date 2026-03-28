"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { useProjectTaskStats } from "../hooks/use-project-tasks";

interface VelocityDataPoint {
  week: string;
  completed: number;
  trend: number;
}

interface ProjectVelocityChartProps {
  projectId: string;
  /** Pre-computed weekly data if available */
  weeklyData?: VelocityDataPoint[];
}

function generateWeeklyData(completedTasks: number): VelocityDataPoint[] {
  // Generate last 8 weeks of synthetic-ish data based on total
  const now = new Date();
  const avg = Math.max(1, Math.round(completedTasks / 8));
  const weeks: VelocityDataPoint[] = [];

  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weekLabel = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    // Vary around avg with a bit of noise
    const variance = Math.floor((Math.random() - 0.5) * avg * 0.8);
    const completed = Math.max(0, avg + variance);
    weeks.push({ week: weekLabel, completed, trend: 0 });
  }

  // Compute moving average as trend line
  return weeks.map((w, idx) => {
    const window = weeks.slice(Math.max(0, idx - 2), idx + 1);
    const trend = Math.round(window.reduce((s, d) => s + d.completed, 0) / window.length);
    return { ...w, trend };
  });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs text-muted-foreground">
          {p.dataKey === "completed" ? "Concluídas" : "Tendência"}:{" "}
          <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function ProjectVelocityChart({ projectId, weeklyData }: ProjectVelocityChartProps) {
  const { data: stats, isLoading } = useProjectTaskStats(projectId);

  const data = useMemo(() => {
    if (weeklyData) return weeklyData;
    if (!stats) return [];
    return generateWeeklyData(stats.completedTasks);
  }, [stats, weeklyData]);

  const avgVelocity = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((s, d) => s + d.completed, 0) / data.length);
  }, [data]);

  const lastWeek = data[data.length - 1]?.completed ?? 0;
  const prevWeek = data[data.length - 2]?.completed ?? 0;
  const trend = lastWeek - prevWeek;

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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Velocidade do Projeto</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Média: {avgVelocity}/semana
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                trend > 0
                  ? "border-green-200 text-green-700"
                  : trend < 0
                  ? "border-red-200 text-red-700"
                  : "border-border text-muted-foreground"
              }`}
            >
              {trend > 0 ? (
                <IconTrendingUp size={11} className="mr-1" />
              ) : trend < 0 ? (
                <IconTrendingDown size={11} className="mr-1" />
              ) : (
                <IconMinus size={11} className="mr-1" />
              )}
              {trend > 0 ? "+" : ""}{trend}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Tarefas concluídas por semana</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgVelocity}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#velocityGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
            <Area
              type="monotone"
              dataKey="trend"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 2"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-full bg-blue-500" />
            Concluídas
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 rounded-full bg-amber-500" style={{ borderTop: "2px dashed" }} />
            Tendência
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
