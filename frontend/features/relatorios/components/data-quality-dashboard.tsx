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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import {
  IconRefresh,
  IconLoader2,
  IconAlertTriangle,
  IconCircleCheck,
  IconBriefcase,
  IconUsers,
  IconCurrencyDollar,
  IconBuildingStore,
  IconTarget,
  IconGripVertical,
  IconSettings,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useDataQualityScores, useRunDataQualityScan } from "../hooks/use-reports";
import type { DataQualityScore } from "../services/data-quality";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "excellent" | "good" | "warning";
type ModuleFilter = "all" | "projects" | "people" | "finance" | "commercial" | "okrs";
type GroupBy = "none" | "status";

interface Thresholds {
  excellent: number;
  good: number;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEY = "dq_thresholds_v1";

function loadThresholds(): Thresholds {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Thresholds;
  } catch {
    // ignore
  }
  return { excellent: 85, good: 70 };
}

function saveThresholds(t: Thresholds) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(t));
  } catch {
    // ignore
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MODULE_ICONS: Record<string, React.ReactNode> = {
  projects: <IconBriefcase className="h-4 w-4" />,
  people: <IconUsers className="h-4 w-4" />,
  finance: <IconCurrencyDollar className="h-4 w-4" />,
  commercial: <IconBuildingStore className="h-4 w-4" />,
  okrs: <IconTarget className="h-4 w-4" />,
};

const MODULE_LABELS: Record<string, string> = {
  projects: "Projetos",
  people: "Pessoas",
  finance: "Financeiro",
  commercial: "Comercial",
  okrs: "OKRs",
  culture: "Cultura",
  contracts: "Contratos",
};

function getScoreStatus(pct: number, thresholds: Thresholds): "excellent" | "good" | "warning" {
  if (pct >= thresholds.excellent) return "excellent";
  if (pct >= thresholds.good) return "good";
  return "warning";
}

function scoreColor(pct: number, thresholds: Thresholds): string {
  const s = getScoreStatus(pct, thresholds);
  return s === "excellent" ? "#10b981" : s === "good" ? "#f59e0b" : "#ef4444";
}

function scoreTextClass(pct: number, thresholds: Thresholds): string {
  const s = getScoreStatus(pct, thresholds);
  return s === "excellent"
    ? "text-emerald-600"
    : s === "good"
    ? "text-amber-600"
    : "text-red-500";
}

const STATUS_LABEL: Record<"excellent" | "good" | "warning", string> = {
  excellent: "Excelente",
  good: "Bom",
  warning: "Precisa Atenção",
};

// ── Overall Gauge ─────────────────────────────────────────────────────────────

export function OverallGauge({ pct, thresholds }: { pct: number; thresholds: Thresholds }) {
  const color = scoreColor(pct, thresholds);
  const status = getScoreStatus(pct, thresholds);
  const data = [{ name: "Qualidade", value: pct, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="70%"
            innerRadius="65%"
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
              style={{ fontSize: "1.5rem", fontWeight: 700, fill: color }}
            >
              {pct.toFixed(0)}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm font-medium">Score Geral</p>
      <Badge
        variant="outline"
        className={
          status === "excellent"
            ? "border-emerald-500 text-emerald-600"
            : status === "good"
            ? "border-amber-500 text-amber-600"
            : "border-red-500 text-red-500"
        }
      >
        {STATUS_LABEL[status]}
      </Badge>
    </div>
  );
}

// ── Module Quality Card ───────────────────────────────────────────────────────

export function ModuleQualityCard({
  score,
  thresholds,
}: {
  score: DataQualityScore;
  thresholds: Thresholds;
}) {
  const pct = Number(score.completeness_pct ?? 0);
  const missing = (score.missing_critical ?? []) as Array<{
    field: string;
    label: string;
    missing_count: number;
  }>;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-muted p-1.5">
              {MODULE_ICONS[score.module] ?? <IconBriefcase className="h-4 w-4" />}
            </div>
            <CardTitle className="text-sm">
              {MODULE_LABELS[score.module] ?? score.module}
            </CardTitle>
          </div>
          <span className={`text-lg font-bold ${scoreTextClass(pct, thresholds)}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={pct} className="h-2" />

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{score.total_records.toLocaleString("pt-BR")} registros</span>
          <span>{score.total_fields.toLocaleString("pt-BR")} campos verificados</span>
        </div>

        {missing.length > 0 ? (
          <div className="space-y-1">
            <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <IconAlertTriangle className="h-3 w-3" />
              Campos críticos ausentes
            </p>
            <div className="space-y-1">
              {missing.slice(0, 4).map((m) => (
                <div key={m.field} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.label}</span>
                  <Badge variant="destructive" className="text-xs">
                    {m.missing_count.toLocaleString("pt-BR")} sem preencher
                  </Badge>
                </div>
              ))}
              {missing.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{missing.length - 4} outros campos com dados ausentes
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <IconCircleCheck className="h-3.5 w-3.5" />
            Todos os campos críticos preenchidos
          </div>
        )}

        {score.computed_at && (
          <p className="text-xs text-muted-foreground">
            Última varredura: {new Date(score.computed_at).toLocaleString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Thresholds Sheet ──────────────────────────────────────────────────────────

function ThresholdsSheet({
  thresholds,
  onChange,
}: {
  thresholds: Thresholds;
  onChange: (t: Thresholds) => void;
}) {
  const [local, setLocal] = useState<Thresholds>(thresholds);

  const handleSave = () => {
    saveThresholds(local);
    onChange(local);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <IconSettings className="mr-2 h-4 w-4" />
          Configurar Thresholds
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Thresholds de Qualidade</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="font-semibold">
              Excelente (≥ {local.excellent}%)
            </Label>
            <Slider
              min={50}
              max={100}
              step={1}
              value={[local.excellent]}
              onValueChange={([v]) =>
                setLocal((prev) => ({ ...prev, excellent: Math.max(v, prev.good + 1) }))
              }
            />
          </div>
          <div className="space-y-3">
            <Label className="font-semibold">
              Bom (≥ {local.good}%)
            </Label>
            <Slider
              min={30}
              max={local.excellent - 1}
              step={1}
              value={[local.good]}
              onValueChange={([v]) =>
                setLocal((prev) => ({ ...prev, good: v }))
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Abaixo de {local.good}% = Precisa Atenção
          </p>
          <Button className="w-full" onClick={handleSave}>
            Salvar Thresholds
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Sortable Card Wrapper ─────────────────────────────────────────────────────

function SortableCardWrapper({
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

// ── Group Header ──────────────────────────────────────────────────────────────

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="col-span-full flex items-center gap-2 py-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <Badge variant="secondary" className="text-xs">{count}</Badge>
      <hr className="flex-1 border-border" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DataQualityDashboard() {
  const { data: scores = [], isLoading } = useDataQualityScores();
  const scanMutation = useRunDataQualityScan();

  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [order, setOrder] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleScan = useCallback(async () => {
    await scanMutation.mutateAsync();
    toast.success("Varredura concluída com sucesso.");
  }, [scanMutation]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const ids = prev.length > 0 ? prev : scores.map((s) => s.id);
      const oldIdx = ids.indexOf(String(active.id));
      const newIdx = ids.indexOf(String(over.id));
      return arrayMove(ids, oldIdx, newIdx);
    });
  }, [scores]);

  const overallPct = useMemo(
    () =>
      scores.length > 0
        ? scores.reduce((s, sc) => s + Number(sc.completeness_pct ?? 0), 0) / scores.length
        : 0,
    [scores]
  );

  const filteredScores = useMemo(() => {
    let items = [...scores];

    if (order.length > 0) {
      const idxMap = new Map(order.map((id, i) => [id, i]));
      items.sort((a, b) => (idxMap.get(a.id) ?? 999) - (idxMap.get(b.id) ?? 999));
    }

    if (moduleFilter !== "all") items = items.filter((s) => s.module === moduleFilter);

    if (statusFilter !== "all") {
      items = items.filter((s) => {
        const pct = Number(s.completeness_pct ?? 0);
        const status = getScoreStatus(pct, thresholds);
        return status === statusFilter;
      });
    }

    return items;
  }, [scores, order, moduleFilter, statusFilter, thresholds]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return new Map([["__all__", filteredScores]]);
    const map = new Map<string, DataQualityScore[]>();
    for (const s of filteredScores) {
      const pct = Number(s.completeness_pct ?? 0);
      const key = getScoreStatus(pct, thresholds);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filteredScores, groupBy, thresholds]);

  const allIds = useMemo(() => filteredScores.map((s) => s.id), [filteredScores]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-28 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-8">
          {scores.length > 0 ? (
            <OverallGauge pct={overallPct} thresholds={thresholds} />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground">
              <p className="px-4 text-center text-xs">Rode uma varredura para ver o score</p>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="font-semibold">Qualidade de Dados</h3>
            <p className="text-sm text-muted-foreground">
              {scores.length} módulos analisados
            </p>
            {scores.length > 0 && (
              <div className="space-y-1 pt-2">
                {scores.map((sc) => (
                  <div key={sc.module} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-muted-foreground">
                      {MODULE_LABELS[sc.module] ?? sc.module}
                    </span>
                    <Progress value={Number(sc.completeness_pct ?? 0)} className="h-1.5 w-24" />
                    <span className={scoreTextClass(Number(sc.completeness_pct ?? 0), thresholds)}>
                      {Number(sc.completeness_pct ?? 0).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleScan}
          disabled={scanMutation.isPending}
          variant="outline"
        >
          {scanMutation.isPending ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconRefresh className="mr-2 h-4 w-4" />
          )}
          {scanMutation.isPending ? "Analisando..." : "Rodar Varredura"}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="excellent">Excelente (≥{thresholds.excellent}%)</SelectItem>
            <SelectItem value="good">Bom ({thresholds.good}–{thresholds.excellent - 1}%)</SelectItem>
            <SelectItem value="warning">Atenção (&lt;{thresholds.good}%)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v as ModuleFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os módulos</SelectItem>
            <SelectItem value="projects">Projetos</SelectItem>
            <SelectItem value="people">Pessoas</SelectItem>
            <SelectItem value="finance">Financeiro</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
            <SelectItem value="okrs">OKRs</SelectItem>
          </SelectContent>
        </Select>

        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem agrupamento</SelectItem>
            <SelectItem value="status">Por status</SelectItem>
          </SelectContent>
        </Select>

        <ThresholdsSheet thresholds={thresholds} onChange={setThresholds} />
      </div>

      {/* Module cards */}
      {filteredScores.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={allIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from(grouped.entries()).map(([groupKey, groupScores]) => (
                <>
                  {groupBy !== "none" && (
                    <GroupHeader
                      key={`gh-${groupKey}`}
                      label={STATUS_LABEL[groupKey as "excellent" | "good" | "warning"] ?? groupKey}
                      count={groupScores.length}
                    />
                  )}
                  {groupScores.map((score) => (
                    <SortableCardWrapper key={score.id} id={score.id}>
                      <ModuleQualityCard score={score} thresholds={thresholds} />
                    </SortableCardWrapper>
                  ))}
                </>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {filteredScores.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-16 text-center">
            <IconAlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">
              {scores.length === 0
                ? "Nenhuma varredura realizada"
                : "Nenhum módulo encontrado com os filtros aplicados"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {scores.length === 0
                ? 'Clique em "Rodar Varredura" para analisar a qualidade dos dados.'
                : "Ajuste os filtros para ver mais módulos."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
