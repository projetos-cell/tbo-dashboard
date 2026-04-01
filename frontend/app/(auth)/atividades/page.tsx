"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/shared";
import { GlobalActivityTimeline } from "@/features/atividades/components/global-activity-timeline";
import {
  useGlobalActivity,
  useActivityActors,
  useActivityEntityTypes,
} from "@/features/atividades/hooks/use-global-activity";
import type { GlobalActivityFilters, GlobalActivityPeriod } from "@/features/atividades/services/global-activity";
import { IconActivity, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const T = {
  text: "#0f0f0f",
  muted: "#4a4a4a",
  orange: "#c45a1a",
  orangeGlow: "rgba(196,90,26,0.10)",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow: "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  r: "16px",
  rSm: "10px",
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`} style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.r, boxShadow: T.glassShadow }}>
      {children}
    </div>
  );
}

const PERIOD_OPTIONS: { value: GlobalActivityPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "all", label: "Tudo" },
];

function formatEntityTypeLabel(type: string): string {
  const labels: Record<string, string> = { project: "Projeto", task: "Tarefa", section: "Seção", comment: "Comentário", attachment: "Anexo" };
  return labels[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AtividadesPage() {
  const [period, setPeriod] = useState<GlobalActivityPeriod>("7d");
  const [entityType, setEntityType] = useState("");
  const [actorId, setActorId] = useState("");
  const [page, setPage] = useState(0);

  const filters: GlobalActivityFilters = useMemo(() => ({ period, entity_type: entityType || undefined, actor_id: actorId || undefined }), [period, entityType, actorId]);

  const { data, isLoading, error, refetch } = useGlobalActivity(filters, page);
  const { data: actors = [] } = useActivityActors();
  const { data: entityTypes = [] } = useActivityEntityTypes();

  const items = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 50);
  const hasFilters = !!(entityType || actorId);

  function clearFilters() { setEntityType(""); setActorId(""); setPage(0); }

  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        {/* Left Sidebar — Filters */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Período</h3>
            <div className="space-y-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setPeriod(opt.value); setPage(0); }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: period === opt.value ? T.orangeGlow : "transparent", color: period === opt.value ? T.orange : T.text }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SectionCard>

          {entityTypes.length > 0 && (
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Tipo</h3>
              <div className="space-y-1">
                <button type="button" onClick={() => { setEntityType(""); setPage(0); }} className="w-full flex items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-colors" style={{ background: !entityType ? T.orangeGlow : "transparent", color: !entityType ? T.orange : T.text }}>
                  Todas
                </button>
                {entityTypes.map((t) => (
                  <button key={t} type="button" onClick={() => { setEntityType(t); setPage(0); }} className="w-full flex items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-black/[0.03]" style={{ background: entityType === t ? T.orangeGlow : "transparent", color: entityType === t ? T.orange : T.text }}>
                    {formatEntityTypeLabel(t)}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {actors.length > 0 && (
            <SectionCard>
              <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Pessoa</h3>
              <Select value={actorId} onValueChange={(v) => { setActorId(v); setPage(0); }}>
                <SelectTrigger className="w-full text-xs"><SelectValue placeholder="Qualquer pessoa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer pessoa</SelectItem>
                  {actors.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name ?? a.id}</SelectItem>)}
                </SelectContent>
              </Select>
            </SectionCard>
          )}
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0 p-5 space-y-4">
          {/* Header Bar */}
          <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
            <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex gap-2">
                {PERIOD_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setPeriod(opt.value); setPage(0); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: period === opt.value ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {totalCount > 0 && <span className="text-lg font-bold text-white tabular-nums">{totalCount.toLocaleString("pt-BR")}<span className="text-[10px] text-white/40 ml-1">eventos</span></span>}
                {hasFilters && <button onClick={clearFilters} className="text-[11px] text-white/60 hover:text-white px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>Limpar</button>}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {!isLoading && items.length === 0 ? (
            <EmptyState icon={IconActivity} title="Nenhuma atividade encontrada" description={hasFilters ? "Tente ajustar os filtros." : "As ações da plataforma aparecem aqui."} cta={hasFilters ? { label: "Limpar filtros", onClick: clearFilters } : undefined} />
          ) : (
            <GlobalActivityTimeline items={items} isLoading={isLoading} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  <IconChevronLeft className="size-4 mr-1" /> Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  Próximo <IconChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar — empty */}
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4" style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}>
          <SectionCard>
            <div className="text-center py-4">
              <IconActivity className="size-5 mx-auto mb-1" style={{ color: T.muted, opacity: 0.3 }} />
              <p className="text-[11px]" style={{ color: T.muted }}>Atividades em tempo real de toda a plataforma.</p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
