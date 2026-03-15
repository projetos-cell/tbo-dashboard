"use client";

import { useMemo } from "react";
import {
  IconTarget,
  IconCircleCheck,
  IconAlertTriangle,
  IconPlayerPlay,
  IconChartDonut,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import { isPast, isToday, subWeeks, startOfWeek, format, eachWeekOfInterval, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { parents, isLoading } = useProjectTasks(projectId);

  // Compute stats
  const stats = useMemo(() => {
    const total = parents.length;
    const completed = parents.filter((t) => t.is_completed).length;
    const overdue = parents.filter(
      (t) =>
        !t.is_completed &&
        t.due_date &&
        isPast(new Date(t.due_date)) &&
        !isToday(new Date(t.due_date)),
    ).length;
    const inProgress = parents.filter(
      (t) => !t.is_completed && (t.status === "em_andamento" || t.status === "revisao"),
    ).length;

    return { total, completed, overdue, inProgress };
  }, [parents]);

  // Status donut data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of parents) {
      const s = t.status ?? "pendente";
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return Object.entries(counts).map(([key, value]) => ({
      name: TASK_STATUS[key as TaskStatusKey]?.label ?? key,
      value,
      color: TASK_STATUS[key as TaskStatusKey]?.color ?? "#6b7280",
    }));
  }, [parents]);

  // Priority bar data
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of parents) {
      const p = t.priority ?? "sem";
      counts[p] = (counts[p] ?? 0) + 1;
    }
    return Object.entries(counts)
      .filter(([key]) => key !== "sem")
      .map(([key, value]) => ({
        name: TASK_PRIORITY[key as TaskPriorityKey]?.label ?? key,
        value,
        fill: TASK_PRIORITY[key as TaskPriorityKey]?.color ?? "#6b7280",
      }));
  }, [parents]);

  // Weekly completion line chart (last 6 weeks)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
      const label = format(weekStart, "dd/MM", { locale: ptBR });

      const count = parents.filter((t) => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= weekStart && d < weekEnd;
      }).length;

      weeks.push({ week: label, count });
    }

    return weeks;
  }, [parents]);

  // R03 — Burn-up chart: cumulative planned vs completed over 8 weeks
  const burnupData = useMemo(() => {
    if (parents.length === 0) return [];
    const now = new Date();
    const weekStarts = eachWeekOfInterval(
      { start: subWeeks(now, 7), end: now },
      { weekStartsOn: 1 },
    );

    return weekStarts.map((ws) => {
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 7);
      // Planned: tasks created before this week end
      const planned = parents.filter((t) => {
        const created = t.created_at ? new Date(t.created_at) : null;
        return created && isBefore(created, weekEnd);
      }).length;
      // Completed: tasks completed before this week end
      const completed = parents.filter((t) => {
        if (!t.completed_at) return false;
        return isBefore(new Date(t.completed_at), weekEnd);
      }).length;
      return {
        week: format(ws, "dd/MM", { locale: ptBR }),
        planned,
        completed,
      };
    });
  }, [parents]);

  // R07 — Velocity: tasks completed per week (last 8 weeks)
  const velocityData = useMemo(() => {
    const now = new Date();
    const data: { week: string; velocity: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const we = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
      const count = parents.filter((t) => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= ws && d < we;
      }).length;
      data.push({ week: format(ws, "dd/MM", { locale: ptBR }), velocity: count });
    }
    return data;
  }, [parents]);

  const avgVelocity = useMemo(() => {
    if (velocityData.length === 0) return 0;
    const sum = velocityData.reduce((acc, d) => acc + d.velocity, 0);
    return Math.round((sum / velocityData.length) * 10) / 10;
  }, [velocityData]);

  const remainingTasks = stats.total - stats.completed;
  const estimatedWeeks = avgVelocity > 0 ? Math.ceil(remainingTasks / avgVelocity) : null;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
        <Skeleton className="h-64 w-full md:col-span-2" />
        <Skeleton className="h-64 w-full md:col-span-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Number tiles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={<IconTarget className="size-4 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Concluídas"
          value={stats.completed}
          icon={<IconCircleCheck className="size-4 text-green-500" />}
          color="green"
          subtitle={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : undefined}
        />
        <StatCard
          title="Em Andamento"
          value={stats.inProgress}
          icon={<IconPlayerPlay className="size-4 text-amber-500" />}
          color="amber"
        />
        <StatCard
          title="Atrasadas"
          value={stats.overdue}
          icon={<IconAlertTriangle className="size-4 text-red-500" />}
          color="red"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Status donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconChartDonut className="size-4 text-muted-foreground" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={priorityData} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {priorityData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly completion line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Tarefas Concluídas por Semana (últimas 6 semanas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 4 }}
                name="Concluídas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* R03 — Burn-up chart */}
      {burnupData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTrendingUp className="size-4 text-muted-foreground" />
              Burn-up (últimas 8 semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={burnupData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area
                  type="monotone"
                  dataKey="planned"
                  stroke="#3b82f6"
                  fill="#3b82f620"
                  strokeWidth={2}
                  name="Planejadas"
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  fill="#22c55e20"
                  strokeWidth={2}
                  name="Concluídas"
                  dot={{ fill: "#22c55e", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* R07 — Velocity card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Velocidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-baseline gap-6">
            <div>
              <span className="text-2xl font-bold tabular-nums">{avgVelocity}</span>
              <span className="ml-1 text-xs text-muted-foreground">tasks/semana</span>
            </div>
            {estimatedWeeks !== null && remainingTasks > 0 && (
              <div className="text-xs text-muted-foreground">
                ~{estimatedWeeks} {estimatedWeeks === 1 ? "semana" : "semanas"} para concluir ({remainingTasks} restantes)
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={velocityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              />
              <Bar dataKey="velocity" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Concluídas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          {icon}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
