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
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCurrencyDollar,
  IconChartBar,
  IconClock,
  IconTarget,
  IconBriefcase,
  IconGripVertical,
  IconSettings,
} from "@tabler/icons-react";
import { useUnitEconomics } from "../hooks/use-reports";
import type { UnitEconomics } from "../services/unit-economics";

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupFilter = "all" | "financial" | "people" | "efficiency";
type PeriodMode = "current_year" | "trailing_12" | "custom";

interface Benchmarks {
  ltv_cac_ratio: { good: number; excellent: number };
  payback_period_months: { good: number; excellent: number };
  revenue_per_employee: { good: number; excellent: number };
}

type MetricId = "cac" | "ltv" | "ltv_cac" | "payback" | "revenue_per_person" | "profit_per_person" | "headcount";

interface MetricDef {
  id: MetricId;
  title: string;
  group: GroupFilter;
  icon: React.ReactNode;
  benchmarkKey?: keyof Benchmarks;
}

// ── Metric Definitions ────────────────────────────────────────────────────────

const METRIC_DEFS: MetricDef[] = [
  { id: "cac", title: "CAC", group: "financial", icon: <IconCurrencyDollar className="h-4 w-4" /> },
  { id: "ltv", title: "LTV", group: "financial", icon: <IconTarget className="h-4 w-4" /> },
  { id: "ltv_cac", title: "LTV / CAC", group: "financial", icon: <IconChartBar className="h-4 w-4" />, benchmarkKey: "ltv_cac_ratio" },
  { id: "payback", title: "Payback", group: "efficiency", icon: <IconClock className="h-4 w-4" />, benchmarkKey: "payback_period_months" },
  { id: "revenue_per_person", title: "Receita / Pessoa", group: "efficiency", icon: <IconUsers className="h-4 w-4" />, benchmarkKey: "revenue_per_employee" },
  { id: "profit_per_person", title: "Lucro / Pessoa", group: "people", icon: <IconBriefcase className="h-4 w-4" /> },
  { id: "headcount", title: "Headcount", group: "people", icon: <IconUsers className="h-4 w-4" /> },
];

const GROUP_LABELS: Record<GroupFilter, string> = {
  all: "Todos",
  financial: "Financeiro",
  efficiency: "Eficiência",
  people: "Pessoas",
};

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "ue_benchmarks_v1";

function loadBenchmarks(): Benchmarks {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Benchmarks;
  } catch {
    // ignore
  }
  return {
    ltv_cac_ratio: { good: 3, excellent: 5 },
    payback_period_months: { good: 12, excellent: 6 },
    revenue_per_employee: { good: 200000, excellent: 400000 },
  };
}

function saveBenchmarks(b: Benchmarks) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(b));
  } catch {
    // ignore
  }
}

// ── Benchmark status ──────────────────────────────────────────────────────────

function getBenchmarkStatus(
  key: keyof Benchmarks,
  value: number,
  benchmarks: Benchmarks
): "excellent" | "good" | "warning" | "unknown" {
  const b = benchmarks[key];
  if (!b) return "unknown";
  const isLowerBetter = key === "payback_period_months";
  if (isLowerBetter) {
    if (value <= b.excellent) return "excellent";
    if (value <= b.good) return "good";
    return "warning";
  }
  if (value >= b.excellent) return "excellent";
  if (value >= b.good) return "good";
  return "warning";
}

const STATUS_COLORS = {
  excellent: "text-emerald-600",
  good: "text-blue-600",
  warning: "text-amber-600",
  unknown: "text-muted-foreground",
};

const STATUS_LABELS = {
  excellent: "Excelente",
  good: "Bom",
  warning: "Atenção",
  unknown: "—",
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

export function Sparkline({ color = "#18181B" }: { color?: string }) {
  const data = [40, 45, 38, 52, 60, 55, 65, 70, 68, 75, 72, 80].map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={`${color}20`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  benchmarkKey?: keyof Benchmarks;
  benchmarkValue?: number;
  benchmarks: Benchmarks;
  trend?: "up" | "down" | "neutral";
  sparklineColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  benchmarkKey,
  benchmarkValue,
  benchmarks,
  trend,
  sparklineColor = "#18181B",
}: MetricCardProps) {
  const benchStatus =
    benchmarkKey !== undefined && benchmarkValue !== undefined
      ? getBenchmarkStatus(benchmarkKey, benchmarkValue, benchmarks)
      : null;

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-muted p-1.5">{icon}</div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {benchStatus && (
            <Badge
              variant="outline"
              className={`text-xs ${STATUS_COLORS[benchStatus]}`}
            >
              {STATUS_LABELS[benchStatus]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div
              className={
                trend === "up"
                  ? "text-emerald-600"
                  : trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {trend === "up" ? (
                <IconTrendingUp className="h-5 w-5" />
              ) : trend === "down" ? (
                <IconTrendingDown className="h-5 w-5" />
              ) : null}
            </div>
          )}
        </div>
        <Sparkline color={sparklineColor} />
      </CardContent>
    </Card>
  );
}

// ── Summary Strip ─────────────────────────────────────────────────────────────

export function SummaryStrip({ data }: { data: UnitEconomics }) {
  const margin_pct =
    data.total_revenue > 0 ? (data.gross_profit / data.total_revenue) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Receita Total</p>
            <p className="text-sm font-semibold">{fmt(data.total_revenue)}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Lucro Bruto</p>
            <p className="text-sm font-semibold">{fmt(data.gross_profit)}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className="text-sm font-semibold">{margin_pct.toFixed(1)}%</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Headcount</p>
            <p className="text-sm font-semibold">{data.headcount} pessoas</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Novos Clientes</p>
            <p className="text-sm font-semibold">{data.new_clients_period}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Gasto Marketing</p>
            <p className="text-sm font-semibold">{fmt(data.marketing_spend)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Benchmarks Sheet ──────────────────────────────────────────────────────────

function BenchmarksSheet({
  benchmarks,
  onChange,
}: {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
}) {
  const [local, setLocal] = useState<Benchmarks>(benchmarks);

  const handleSave = () => {
    saveBenchmarks(local);
    onChange(local);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <IconSettings className="mr-2 h-4 w-4" />
          Editar Benchmarks
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Benchmarks</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="font-semibold">LTV/CAC ratio</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bom (≥)</span>
                <span className="font-medium">{local.ltv_cac_ratio.good}x</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={[local.ltv_cac_ratio.good]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    ltv_cac_ratio: { ...prev.ltv_cac_ratio, good: v },
                  }))
                }
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Excelente (≥)</span>
                <span className="font-medium">{local.ltv_cac_ratio.excellent}x</span>
              </div>
              <Slider
                min={1}
                max={20}
                step={0.5}
                value={[local.ltv_cac_ratio.excellent]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    ltv_cac_ratio: { ...prev.ltv_cac_ratio, excellent: v },
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Payback (meses)</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bom (≤)</span>
                <span className="font-medium">{local.payback_period_months.good} meses</span>
              </div>
              <Slider
                min={1}
                max={36}
                step={1}
                value={[local.payback_period_months.good]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    payback_period_months: { ...prev.payback_period_months, good: v },
                  }))
                }
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Excelente (≤)</span>
                <span className="font-medium">{local.payback_period_months.excellent} meses</span>
              </div>
              <Slider
                min={1}
                max={24}
                step={1}
                value={[local.payback_period_months.excellent]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    payback_period_months: { ...prev.payback_period_months, excellent: v },
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold">Receita/Pessoa (R$)</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bom (≥)</span>
                <span className="font-medium">
                  {local.revenue_per_employee.good.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </span>
              </div>
              <Slider
                min={50000}
                max={1000000}
                step={10000}
                value={[local.revenue_per_employee.good]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    revenue_per_employee: { ...prev.revenue_per_employee, good: v },
                  }))
                }
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Excelente (≥)</span>
                <span className="font-medium">
                  {local.revenue_per_employee.excellent.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </span>
              </div>
              <Slider
                min={100000}
                max={2000000}
                step={10000}
                value={[local.revenue_per_employee.excellent]}
                onValueChange={([v]) =>
                  setLocal((prev) => ({
                    ...prev,
                    revenue_per_employee: { ...prev.revenue_per_employee, excellent: v },
                  }))
                }
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleSave}>
            Salvar Benchmarks
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Sortable Card Wrapper ─────────────────────────────────────────────────────

function SortableMetricCardWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

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
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function UnitEconomicsDashboard() {
  const { data, isLoading, error } = useUnitEconomics();

  const [period, setPeriod] = useState<PeriodMode>("current_year");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(loadBenchmarks);
  const [order, setOrder] = useState<MetricId[]>(METRIC_DEFS.map((m) => m.id));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as MetricId);
      const newIdx = prev.indexOf(over.id as MetricId);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  const visibleDefs = useMemo(
    () =>
      order
        .map((id) => METRIC_DEFS.find((d) => d.id === id)!)
        .filter((d) => d && (groupFilter === "all" || d.group === groupFilter)),
    [order, groupFilter]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Erro ao calcular unit economics.
        </CardContent>
      </Card>
    );
  }

  const fmt = (n: number, currency = false) =>
    n.toLocaleString(
      "pt-BR",
      currency
        ? { style: "currency", currency: "BRL", maximumFractionDigits: 0 }
        : { maximumFractionDigits: 2 }
    );

  function buildCard(def: MetricDef) {
    switch (def.id) {
      case "cac":
        return (
          <MetricCard
            title="CAC"
            value={fmt(data!.cac, true)}
            subtitle="Custo de Aquisição por Cliente"
            icon={def.icon}
            benchmarks={benchmarks}
            trend={data!.cac < 5000 ? "up" : "down"}
            sparklineColor="#3b82f6"
          />
        );
      case "ltv":
        return (
          <MetricCard
            title="LTV"
            value={fmt(data!.ltv, true)}
            subtitle="Lifetime Value estimado"
            icon={def.icon}
            benchmarks={benchmarks}
            trend="up"
            sparklineColor="#10b981"
          />
        );
      case "ltv_cac":
        return (
          <MetricCard
            title="LTV / CAC"
            value={`${data!.ltv_cac_ratio.toFixed(2)}x`}
            subtitle={`Meta: ≥ ${benchmarks.ltv_cac_ratio.good}x`}
            icon={def.icon}
            benchmarkKey="ltv_cac_ratio"
            benchmarkValue={data!.ltv_cac_ratio}
            benchmarks={benchmarks}
            trend={data!.ltv_cac_ratio >= benchmarks.ltv_cac_ratio.good ? "up" : "down"}
            sparklineColor={data!.ltv_cac_ratio >= benchmarks.ltv_cac_ratio.good ? "#10b981" : "#f59e0b"}
          />
        );
      case "payback":
        return (
          <MetricCard
            title="Payback"
            value={`${data!.payback_period_months.toFixed(1)} meses`}
            subtitle="Tempo para recuperar CAC"
            icon={def.icon}
            benchmarkKey="payback_period_months"
            benchmarkValue={data!.payback_period_months}
            benchmarks={benchmarks}
            trend={data!.payback_period_months <= benchmarks.payback_period_months.good ? "up" : "down"}
            sparklineColor={data!.payback_period_months <= benchmarks.payback_period_months.good ? "#10b981" : "#ef4444"}
          />
        );
      case "revenue_per_person":
        return (
          <MetricCard
            title="Receita / Pessoa"
            value={fmt(data!.revenue_per_employee, true)}
            subtitle="Receita por colaborador ativo"
            icon={def.icon}
            benchmarkKey="revenue_per_employee"
            benchmarkValue={data!.revenue_per_employee}
            benchmarks={benchmarks}
            trend={data!.revenue_per_employee >= benchmarks.revenue_per_employee.good ? "up" : "down"}
            sparklineColor="#8b5cf6"
          />
        );
      case "profit_per_person":
        return (
          <MetricCard
            title="Lucro / Pessoa"
            value={fmt(data!.profit_per_employee, true)}
            subtitle="Resultado por colaborador ativo"
            icon={def.icon}
            benchmarks={benchmarks}
            trend={data!.profit_per_employee > 0 ? "up" : "down"}
            sparklineColor={data!.profit_per_employee > 0 ? "#10b981" : "#ef4444"}
          />
        );
      case "headcount":
        return (
          <MetricCard
            title="Headcount"
            value={String(data!.headcount)}
            subtitle="Colaboradores ativos"
            icon={def.icon}
            benchmarks={benchmarks}
            trend="neutral"
            sparklineColor="#64748b"
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodMode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_year">Ano corrente</SelectItem>
            <SelectItem value="trailing_12">Últimos 12 meses</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as GroupFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(GROUP_LABELS) as GroupFilter[]).map((k) => (
              <SelectItem key={k} value={k}>
                {GROUP_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <BenchmarksSheet benchmarks={benchmarks} onChange={setBenchmarks} />
      </div>

      <SummaryStrip data={data} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDefs.map((def) => {
              const card = buildCard(def);
              if (!card) return null;
              return (
                <SortableMetricCardWrapper key={def.id} id={def.id}>
                  {card}
                </SortableMetricCardWrapper>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-muted-foreground">
        Calculado em {new Date(data.computed_at).toLocaleString("pt-BR")} •{" "}
        Período: {period === "current_year" ? "Ano corrente" : period === "trailing_12" ? "Últimos 12 meses" : "Personalizado"}
      </p>
    </div>
  );
}
