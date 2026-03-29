"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconGripVertical,
  IconDownload,
} from "@tabler/icons-react";
import { useYoYSummary } from "../hooks/use-reports";
import type { YoYResult, YoYMetric } from "../services/yoy-comparison";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_METRICS: YoYMetric[] = [
  "revenue",
  "expenses",
  "margin",
  "deals_won",
  "projects_completed",
  "headcount",
];

const METRIC_LABELS: Record<YoYMetric, string> = {
  revenue: "Receita",
  expenses: "Despesas",
  margin: "Margem",
  deals_won: "Negócios Fechados",
  projects_completed: "Projetos Concluídos",
  headcount: "Headcount",
};

const FINANCIAL_METRICS: YoYMetric[] = ["revenue", "expenses", "margin"];
const OPERACIONAL_METRICS: YoYMetric[] = ["deals_won", "projects_completed", "headcount"];

const CATEGORY_LABELS: Record<string, string> = {
  financeiro: "Financeiro",
  operacional: "Operacional",
};

type GroupBy = "none" | "category";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMetricCategory(metric: YoYMetric): string {
  return FINANCIAL_METRICS.includes(metric) ? "financeiro" : "operacional";
}

function formatValue(value: number, metric: YoYMetric): string {
  if (
    metric === "revenue" ||
    metric === "expenses" ||
    metric === "margin" ||
    metric === "deals_won"
  ) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  return value.toLocaleString("pt-BR");
}

function ChangeBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 0.5) {
    return (
      <Badge variant="secondary" className="gap-1">
        <IconMinus className="h-3 w-3" />
        {pct.toFixed(1)}%
      </Badge>
    );
  }
  const isPositive = pct > 0;
  return (
    <Badge variant={isPositive ? "default" : "destructive"} className="gap-1">
      {isPositive ? (
        <IconTrendingUp className="h-3 w-3" />
      ) : (
        <IconTrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </Badge>
  );
}

// ── YoY Chart (sortable) ──────────────────────────────────────────────────────

function YoYChart({ result, baseYear, compareYear }: { result: YoYResult; baseYear: number; compareYear: number }) {
  const chartData = result.currentYear.map((d, i) => ({
    month: d.label,
    [String(compareYear)]: d.value,
    [String(baseYear)]: result.previousYear[i]?.value ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{result.label}</CardTitle>
          <ChangeBadge pct={result.change_pct} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              width={50}
              tickFormatter={(v: number) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                return String(v);
              }}
            />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value: number | undefined) =>
                formatValue(value ?? 0, result.metric)
              }
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey={String(compareYear)}
              stroke="#18181B"
              strokeWidth={2}
              dot={false}
              name={String(compareYear)}
            />
            <Line
              type="monotone"
              dataKey={String(baseYear)}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              name={String(baseYear)}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
          <div>
            <p className="text-xs text-muted-foreground">{compareYear}</p>
            <p className="text-sm font-semibold">
              {formatValue(result.current_total, result.metric)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{baseYear}</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {formatValue(result.previous_total, result.metric)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Sortable Card Wrapper ─────────────────────────────────────────────────────

function SortableYoYCard({
  result,
  baseYear,
  compareYear,
}: {
  result: YoYResult;
  baseYear: number;
  compareYear: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: result.metric });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 z-10 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <IconGripVertical className="h-4 w-4" />
      </button>
      <YoYChart result={result} baseYear={baseYear} compareYear={compareYear} />
    </div>
  );
}

// ── Summary Table ─────────────────────────────────────────────────────────────

function SummaryTable({
  results,
  baseYear,
  compareYear,
}: {
  results: YoYResult[];
  baseYear: number;
  compareYear: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Resumo Comparativo</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead className="text-right">{compareYear}</TableHead>
              <TableHead className="text-right">{baseYear}</TableHead>
              <TableHead className="text-right">Variação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => (
              <TableRow key={r.metric}>
                <TableCell className="font-medium">{r.label}</TableCell>
                <TableCell className="text-right">
                  {formatValue(r.current_total, r.metric)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatValue(r.previous_total, r.metric)}
                </TableCell>
                <TableCell className="text-right">
                  <ChangeBadge pct={r.change_pct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function exportCsv(results: YoYResult[], baseYear: number, compareYear: number) {
  const rows = [
    ["Métrica", String(compareYear), String(baseYear), "Variação %"],
    ...results.map((r) => [
      r.label,
      String(r.current_total),
      String(r.previous_total),
      r.change_pct.toFixed(2),
    ]),
  ];
  const csv = rows.map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yoy-${compareYear}-vs-${baseYear}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

interface YoYToolbarProps {
  currentYear: number;
  baseYear: number;
  compareYear: number;
  setBaseYear: (v: number) => void;
  setCompareYear: (v: number) => void;
  visibleMetrics: Set<YoYMetric>;
  toggleMetric: (m: YoYMetric) => void;
  groupBy: GroupBy;
  setGroupBy: (v: GroupBy) => void;
  onExport: () => void;
}

function YoYToolbar({
  currentYear,
  baseYear,
  compareYear,
  setBaseYear,
  setCompareYear,
  visibleMetrics,
  toggleMetric,
  groupBy,
  setGroupBy,
  onExport,
}: YoYToolbarProps) {
  const baseYearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Ano base:</span>
        <Select
          value={String(baseYear)}
          onValueChange={(v) => setBaseYear(Number(v))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {baseYearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Comparar com:</span>
        <Select
          value={String(compareYear)}
          onValueChange={(v) => setCompareYear(Number(v))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: currentYear - baseYear }, (_, i) => baseYear + 1 + i).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 rounded-md border px-3 py-1.5">
        {ALL_METRICS.map((m) => (
          <label key={m} className="flex cursor-pointer items-center gap-1.5 text-xs">
            <Checkbox
              checked={visibleMetrics.has(m)}
              onCheckedChange={() => toggleMetric(m)}
            />
            {METRIC_LABELS[m]}
          </label>
        ))}
      </div>

      <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sem agrupamento</SelectItem>
          <SelectItem value="category">Por categoria</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onExport}>
        <IconDownload className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
}

// ── Group Header ──────────────────────────────────────────────────────────────

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="col-span-full py-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <hr className="mt-1 border-border" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function YoYComparisonDashboard() {
  const { data: summary, isLoading, error } = useYoYSummary();

  const currentYear = new Date().getFullYear();
  const [baseYear, setBaseYear] = useState(currentYear - 1);
  const [compareYear, setCompareYear] = useState(currentYear);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<YoYMetric>>(new Set(ALL_METRICS));
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [order, setOrder] = useState<YoYMetric[]>([...ALL_METRICS]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const toggleMetric = useCallback((m: YoYMetric) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as YoYMetric);
      const newIdx = prev.indexOf(over.id as YoYMetric);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  const visibleResults = useMemo(() => {
    if (!summary) return [];
    return order
      .filter((m) => visibleMetrics.has(m) && summary[m])
      .map((m) => summary[m]);
  }, [summary, order, visibleMetrics]);

  const handleExport = useCallback(() => {
    exportCsv(visibleResults, baseYear, compareYear);
  }, [visibleResults, baseYear, compareYear]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Erro ao carregar comparativo anual.
        </CardContent>
      </Card>
    );
  }

  const grouped =
    groupBy === "none"
      ? new Map([["__all__", visibleResults]])
      : (() => {
          const map = new Map<string, YoYResult[]>();
          for (const r of visibleResults) {
            const cat = getMetricCategory(r.metric);
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(r);
          }
          return map;
        })();

  return (
    <div className="space-y-6">
      <YoYToolbar
        currentYear={currentYear}
        baseYear={baseYear}
        compareYear={compareYear}
        setBaseYear={setBaseYear}
        setCompareYear={setCompareYear}
        visibleMetrics={visibleMetrics}
        toggleMetric={toggleMetric}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        onExport={handleExport}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(grouped.entries()).map(([groupKey, groupResults]) => (
              <>
                {groupBy !== "none" && (
                  <GroupHeader
                    key={`gh-${groupKey}`}
                    label={CATEGORY_LABELS[groupKey] ?? groupKey}
                  />
                )}
                {groupResults.map((result) => (
                  <SortableYoYCard
                    key={result.metric}
                    result={result}
                    baseYear={baseYear}
                    compareYear={compareYear}
                  />
                ))}
              </>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <SummaryTable results={visibleResults} baseYear={baseYear} compareYear={compareYear} />
    </div>
  );
}
