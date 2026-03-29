"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { useWidgetData } from "../hooks/use-reports";
import type { BIWidget } from "../services/bi-dashboards";

// ── Constants ─────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#18181B",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCardWidget({
  title,
  value,
  label,
}: {
  title: string;
  value: number;
  label?: string;
}) {
  const formatted =
    typeof value === "number"
      ? value >= 1000
        ? value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
        : value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
      : String(value);

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <p className="text-sm text-muted-foreground">{label ?? title}</p>
      <p className="text-3xl font-bold tracking-tight">{formatted}</p>
    </div>
  );
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

function GaugeWidget({ value, title }: { value: number; title: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const data = [{ name: title, value: pct, fill: "#18181B" }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        cx="50%"
        cy="70%"
        innerRadius="60%"
        outerRadius="90%"
        startAngle={180}
        endAngle={0}
        data={data}
      >
        <RadialBar dataKey="value" background cornerRadius={4} />
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-2xl font-bold"
          style={{ fontSize: "1.5rem", fontWeight: 700 }}
        >
          {pct.toFixed(0)}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

// ── Table Widget ──────────────────────────────────────────────────────────────

function TableWidget({
  points,
}: {
  points: Array<{ label: string; value: number; [key: string]: unknown }>;
}) {
  if (!points.length) return <p className="text-sm text-muted-foreground">Sem dados.</p>;

  const extraKeys = Object.keys(points[0]).filter((k) => k !== "label" && k !== "value");

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            {extraKeys.map((k) => (
              <TableHead key={k} className="text-right capitalize">
                {k.replace(/_/g, " ")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {points.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell className="text-right">
                {typeof row.value === "number"
                  ? row.value.toLocaleString("pt-BR")
                  : String(row.value)}
              </TableCell>
              {extraKeys.map((k) => (
                <TableCell key={k} className="text-right">
                  {typeof row[k] === "number"
                    ? (row[k] as number).toLocaleString("pt-BR")
                    : String(row[k] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Renderer ─────────────────────────────────────────────────────────────

interface BiWidgetRendererProps {
  widget: BIWidget;
}

export function BiWidgetRenderer({ widget }: BiWidgetRendererProps) {
  const { data, isLoading, error } = useWidgetData(widget);

  const points = useMemo(() => data?.points ?? [], [data]);
  const total = data?.total;
  const label = data?.label;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-destructive">Erro ao carregar dados.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const height = 180;

    switch (widget.widget_type) {
      case "kpi_card":
      case "number":
        return (
          <KpiCardWidget
            title={widget.title}
            value={total ?? (points[0]?.value ?? 0)}
            label={label}
          />
        );

      case "bar_chart":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")}
              />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line_chart":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area_chart":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS[0]}
                fill={`${CHART_COLORS[0]}20`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie_chart":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={points}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ label: l, percent }) =>
                  `${l} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {points.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "donut_chart":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={points}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
              >
                {points.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "gauge":
        return (
          <GaugeWidget
            value={total ?? (points[0]?.value ?? 0)}
            title={widget.title}
          />
        );

      case "funnel":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <FunnelChart>
              <Tooltip formatter={(v: number | undefined) => (v ?? 0).toLocaleString("pt-BR")} />
              <Funnel dataKey="value" data={points} isAnimationActive>
                {points.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
                <LabelList position="right" fill="#111" stroke="none" dataKey="label" style={{ fontSize: 11 }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case "table":
      case "heatmap":
      case "metric":
        return <TableWidget points={points} />;

      default:
        return <p className="text-sm text-muted-foreground">Tipo de widget não suportado.</p>;
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          {typeof total === "number" && widget.widget_type !== "kpi_card" && widget.widget_type !== "number" && (
            <span className="text-xs text-muted-foreground">
              Total: {total.toLocaleString("pt-BR")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-56px)]">{renderChart()}</CardContent>
    </Card>
  );
}
