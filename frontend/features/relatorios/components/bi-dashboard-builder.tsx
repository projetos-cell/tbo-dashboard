"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconEye,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconChartDonut,
  IconChartArea,
  IconTable,
  IconHash,
  IconGauge,
  IconChartFunnel,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import {
  useBIWidgets,
  useCreateBIWidget,
  useUpdateBIWidget,
  useDeleteBIWidget,
  useUpdateBIDashboard,
} from "../hooks/use-reports";
import { BiWidgetRenderer } from "./bi-widget-renderer";
import type { BIDashboard, BIWidget, WidgetType, DataSource } from "../services/bi-dashboards";

// ── Widget Palette ─────────────────────────────────────────────────────────────

const WIDGET_TYPES: Array<{ type: WidgetType; label: string; icon: React.ReactNode }> = [
  { type: "kpi_card", label: "KPI Card", icon: <IconHash className="h-4 w-4" /> },
  { type: "number", label: "Número", icon: <IconHash className="h-4 w-4" /> },
  { type: "bar_chart", label: "Barras", icon: <IconChartBar className="h-4 w-4" /> },
  { type: "line_chart", label: "Linhas", icon: <IconChartLine className="h-4 w-4" /> },
  { type: "area_chart", label: "Área", icon: <IconChartArea className="h-4 w-4" /> },
  { type: "pie_chart", label: "Pizza", icon: <IconChartPie className="h-4 w-4" /> },
  { type: "donut_chart", label: "Donut", icon: <IconChartDonut className="h-4 w-4" /> },
  { type: "table", label: "Tabela", icon: <IconTable className="h-4 w-4" /> },
  { type: "gauge", label: "Gauge", icon: <IconGauge className="h-4 w-4" /> },
  { type: "funnel", label: "Funil", icon: <IconChartFunnel className="h-4 w-4" /> },
];

const DATA_SOURCES: Array<{ value: DataSource; label: string }> = [
  { value: "projects", label: "Projetos" },
  { value: "finance", label: "Financeiro" },
  { value: "commercial", label: "Comercial" },
  { value: "people", label: "Pessoas" },
  { value: "okrs", label: "OKRs" },
];

const METRICS_BY_SOURCE: Record<DataSource, Array<{ value: string; label: string }>> = {
  projects: [
    { value: "tasks_by_status", label: "Tarefas por Status" },
    { value: "projects_by_status", label: "Seções de Projetos" },
  ],
  finance: [
    { value: "revenue_by_month", label: "Receita Mensal" },
    { value: "balance_by_month", label: "Resultado Mensal" },
  ],
  commercial: [
    { value: "deals_by_stage", label: "Negócios por Etapa" },
    { value: "pipeline_value", label: "Valor do Pipeline" },
  ],
  people: [
    { value: "headcount_by_department", label: "Headcount por Departamento" },
    { value: "headcount_total", label: "Total de Pessoas" },
  ],
  okrs: [
    { value: "progress_by_objective", label: "OKRs por Status" },
  ],
};

// ── Widget Config Panel ───────────────────────────────────────────────────────

interface WidgetConfigPanelProps {
  widget: BIWidget;
  onClose: () => void;
  dashboardId: string;
}

function WidgetConfigPanel({ widget, onClose, dashboardId }: WidgetConfigPanelProps) {
  const [title, setTitle] = useState(widget.title);
  const [dataSource, setDataSource] = useState<DataSource>(widget.data_source as DataSource);
  const [metric, setMetric] = useState<string>(
    (widget.query_config.metric as string) ?? ""
  );
  const [widgetType, setWidgetType] = useState<WidgetType>(widget.widget_type);
  const updateWidget = useUpdateBIWidget();

  const handleSave = async () => {
    await updateWidget.mutateAsync({
      id: widget.id,
      dashboardId,
      updates: {
        title,
        widget_type: widgetType,
        data_source: dataSource,
        query_config: metric ? { metric } : widget.query_config,
      },
    });
    toast.success("Configuração salva.");
    onClose();
  };

  const availableMetrics = METRICS_BY_SOURCE[dataSource] ?? [];

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="widget-title">Título</Label>
        <Input
          id="widget-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do widget"
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de Gráfico</Label>
        <Select value={widgetType} onValueChange={(v) => setWidgetType(v as WidgetType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIDGET_TYPES.map((wt) => (
              <SelectItem key={wt.type} value={wt.type}>
                <span className="flex items-center gap-2">
                  {wt.icon}
                  {wt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fonte de Dados</Label>
        <Select value={dataSource} onValueChange={(v) => setDataSource(v as DataSource)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATA_SOURCES.map((ds) => (
              <SelectItem key={ds.value} value={ds.value}>
                {ds.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableMetrics.length > 0 && (
        <div className="space-y-2">
          <Label>Métrica</Label>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma métrica" />
            </SelectTrigger>
            <SelectContent>
              {availableMetrics.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={handleSave} className="w-full" size="sm">
        <IconDeviceFloppy className="mr-2 h-4 w-4" />
        Salvar Configuração
      </Button>
    </div>
  );
}

// ── Add Widget Form ───────────────────────────────────────────────────────────

interface AddWidgetFormProps {
  dashboardId: string;
  tenantId: string;
  onAdded: () => void;
}

function AddWidgetForm({ dashboardId, tenantId, onAdded }: AddWidgetFormProps) {
  const [title, setTitle] = useState("Novo Widget");
  const [widgetType, setWidgetType] = useState<WidgetType>("bar_chart");
  const [dataSource, setDataSource] = useState<DataSource>("finance");
  const [metric, setMetric] = useState("");

  const createWidget = useCreateBIWidget();

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error("Informe um título para o widget.");
      return;
    }

    await createWidget.mutateAsync({
      tenant_id: tenantId,
      dashboard_id: dashboardId,
      widget_type: widgetType,
      title,
      data_source: dataSource,
      query_config: metric ? { metric } : {},
    });

    toast.success("Widget adicionado.");
    setTitle("Novo Widget");
    onAdded();
  };

  const availableMetrics = METRICS_BY_SOURCE[dataSource] ?? [];

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Novo Widget</p>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do widget"
        className="h-8 text-sm"
      />

      <Select value={widgetType} onValueChange={(v) => setWidgetType(v as WidgetType)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WIDGET_TYPES.map((wt) => (
            <SelectItem key={wt.type} value={wt.type}>
              {wt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dataSource} onValueChange={(v) => { setDataSource(v as DataSource); setMetric(""); }}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATA_SOURCES.map((ds) => (
            <SelectItem key={ds.value} value={ds.value}>
              {ds.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {availableMetrics.length > 0 && (
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            {availableMetrics.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        onClick={handleAdd}
        disabled={createWidget.isPending}
        className="w-full"
        size="sm"
      >
        {createWidget.isPending ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconPlus className="mr-2 h-4 w-4" />
        )}
        Adicionar
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface BiDashboardBuilderProps {
  dashboard: BIDashboard;
  onSave?: () => void;
}

export function BiDashboardBuilder({ dashboard, onSave }: BiDashboardBuilderProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<BIWidget | null>(null);

  const { data: widgets = [], isLoading } = useBIWidgets(dashboard.id);
  const deleteWidget = useDeleteBIWidget();

  const handleDeleteWidget = useCallback(
    async (widget: BIWidget) => {
      await deleteWidget.mutateAsync({ id: widget.id, dashboardId: dashboard.id });
      toast.success("Widget removido.");
    },
    [deleteWidget, dashboard.id]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar */}
      {!isPreview && (
        <aside className="w-64 shrink-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4 pr-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Dashboard
                </p>
                <p className="text-sm font-medium">{dashboard.name}</p>
                {dashboard.description && (
                  <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                )}
                {dashboard.is_shared && (
                  <Badge variant="secondary" className="text-xs">Compartilhado</Badge>
                )}
              </div>

              <Separator />

              {tenantId && (
                <AddWidgetForm
                  dashboardId={dashboard.id}
                  tenantId={tenantId}
                  onAdded={() => {}}
                />
              )}

              <Separator />

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Widgets ({widgets.length})
                </p>
                {widgets.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-1 rounded p-1 hover:bg-muted"
                  >
                    <span className="flex-1 truncate text-xs">{w.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedWidget(w)}
                    >
                      <IconPencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteWidget(w)}
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* Grid Canvas */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <>
                <IconPencil className="mr-1.5 h-4 w-4" />
                Editar
              </>
            ) : (
              <>
                <IconEye className="mr-1.5 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
          {onSave && (
            <Button size="sm" onClick={onSave}>
              <IconDeviceFloppy className="mr-1.5 h-4 w-4" />
              Salvar
            </Button>
          )}
        </div>

        {widgets.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
            <div className="text-center">
              <IconChartBar className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Adicione widgets pela barra lateral</p>
            </div>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(12, 1fr)",
              gridAutoRows: "80px",
            }}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                style={{
                  gridColumn: `span ${Math.min(widget.width, 12)}`,
                  gridRow: `span ${Math.min(widget.height, 6)}`,
                }}
                className="relative"
              >
                <BiWidgetRenderer widget={widget} />
                {!isPreview && (
                  <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSelectedWidget(widget)}
                    >
                      <IconPencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Config Sheet */}
      <Sheet open={!!selectedWidget} onOpenChange={(open) => !open && setSelectedWidget(null)}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Configurar Widget</SheetTitle>
          </SheetHeader>
          {selectedWidget && (
            <div className="mt-4">
              <WidgetConfigPanel
                widget={selectedWidget}
                dashboardId={dashboard.id}
                onClose={() => setSelectedWidget(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
