"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconArrowRight,
  IconCircleCheck,
  IconClockHour4,
  IconCurrencyDollar,
  IconPlus,
  IconSearch,
  IconTruck,
} from "@tabler/icons-react";
import { usePedidos, useVendors } from "@/features/compras/hooks/use-compras";
import { PedidoForm } from "@/features/compras/components/pedido-form";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "@/features/compras/types";
import type { Pedido } from "@/features/compras/types";

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

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function PedidoRow({ pedido }: { pedido: Pedido }) {
  const statusCfg = STATUS_CONFIG[pedido.status];
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];
  return (
    <div className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-black/[0.03]" style={{ background: T.glass, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm }}>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium" style={{ color: T.text }}>{pedido.titulo}</p>
        <p className="text-[11px]" style={{ color: T.muted }}>{pedido.vendor?.name ?? "Sem fornecedor"}</p>
      </div>
      <div className="ml-4 flex items-center gap-2 shrink-0">
        <span className="text-xs font-medium" style={{ color: prioridadeCfg.color }}>{prioridadeCfg.label}</span>
        <Badge variant={statusCfg.badge} className="text-xs">{statusCfg.label}</Badge>
        <span className="text-sm font-semibold tabular-nums">{formatCurrency(pedido.valor_estimado)}</span>
      </div>
    </div>
  );
}

export default function ComprasDashboardPage() {
  const [pedidoFormOpen, setPedidoFormOpen] = useState(false);
  const { data: pedidos = [], isLoading: loadingPedidos } = usePedidos();
  const { data: vendors = [], isLoading: loadingVendors } = useVendors();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const kpis = useMemo(() => {
    const pendentes = pedidos.filter((p) => p.status === "aguardando_aprovacao").length;
    const valorEmAprovacao = pedidos.filter((p) => p.status === "aguardando_aprovacao").reduce((sum, p) => sum + (p.valor_estimado ?? 0), 0);
    const concluidosMes = pedidos.filter((p) => p.status === "concluido" && p.data_solicitacao && isWithinInterval(parseISO(p.data_solicitacao), { start: monthStart, end: monthEnd })).length;
    return { pendentes, valorEmAprovacao, concluidosMes };
  }, [pedidos, monthStart, monthEnd]);

  const recentPedidos = useMemo(() => [...pedidos].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()).slice(0, 5), [pedidos]);

  const topVendors = useMemo(() => {
    const countMap = new Map<string, { name: string; count: number }>();
    for (const p of pedidos) {
      if (!p.vendor_id || !p.vendor) continue;
      const entry = countMap.get(p.vendor_id);
      if (entry) entry.count++;
      else countMap.set(p.vendor_id, { name: p.vendor.name, count: 1 });
    }
    return [...countMap.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [pedidos]);

  const isLoading = loadingPedidos || loadingVendors;

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="min-h-[calc(100dvh-64px)] p-5 space-y-4 max-w-4xl mx-auto">
          {/* Header Bar */}
          <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
            <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => setPedidoFormOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <IconPlus className="size-3.5" style={{ color: "#10b981" }} />
                  Novo Pedido
                </button>
                <Link href="/compras/orcamentos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <IconClockHour4 className="size-3.5" style={{ color: "#f59e0b" }} />
                  Orçamentos
                </Link>
                <Link href="/compras/fornecedores" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/80 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <IconTruck className="size-3.5" style={{ color: "#3b82f6" }} />
                  Fornecedores
                </Link>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-lg font-bold text-white tabular-nums">{pedidos.length}</span>
                  <span className="text-[10px] text-white/40 ml-1">pedidos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: T.text }}>Pedidos Recentes</h2>
              <Link href="/compras/orcamentos" className="text-[11px] font-medium" style={{ color: T.orange }}>
                Ver todos <IconArrowRight className="inline size-3 -mt-px" />
              </Link>
            </div>
            {loadingPedidos ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : recentPedidos.length === 0 ? (
              <div className="text-center py-8" style={{ background: T.glass, borderRadius: T.r, border: `1px solid ${T.glassBorder}` }}>
                <p className="text-sm" style={{ color: T.muted }}>Nenhum pedido ainda.</p>
                <button className="mt-2 text-xs font-medium" style={{ color: T.orange }} onClick={() => setPedidoFormOpen(true)}>Criar primeiro pedido</button>
              </div>
            ) : (
              <div className="space-y-2">{recentPedidos.map((p) => <PedidoRow key={p.id} pedido={p} />)}</div>
            )}
          </div>

          {/* Modules */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
            <div className="space-y-2">
              {[
                { href: "/compras/orcamentos", label: "Orçamentos & Pedidos", description: "Todos os pedidos de compra", icon: IconClockHour4, color: "#f59e0b" },
                { href: "/compras/fornecedores", label: "Fornecedores", description: "Cadastro e ranking de fornecedores", icon: IconTruck, color: "#3b82f6" },
                { href: "/compras/aprovacoes", label: "Aprovações", description: "Pedidos aguardando aprovação", icon: IconCircleCheck, color: "#22c55e" },
                { href: "/compras/historico", label: "Histórico", description: "Registro completo de compras", icon: IconArrowRight, color: "#8b5cf6" },
              ].map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link key={mod.href} href={mod.href} className="block transition-all hover:scale-[1.005]">
                    <div className="p-4 flex items-center gap-3" style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm, boxShadow: T.glassShadow }}>
                      <div className="rounded-lg p-2.5 shrink-0" style={{ background: `${mod.color}15` }}>
                        <Icon className="size-5" style={{ color: mod.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: T.text }}>{mod.label}</p>
                        <p className="text-[11px] truncate" style={{ color: T.muted }}>{mod.description}</p>
                      </div>
                      <IconArrowRight className="size-4 shrink-0" style={{ color: T.muted }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
      </div>
      <PedidoForm open={pedidoFormOpen} onOpenChange={setPedidoFormOpen} />
    </div>
  );
}
