"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconTruck,
  IconClockHour4,
  IconCurrencyDollar,
  IconCircleCheck,
  IconPlus,
  IconArrowRight,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/shared";
import { usePedidos, useVendors } from "@/features/compras/hooks/use-compras";
import { PedidoForm } from "@/features/compras/components/pedido-form";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "@/features/compras/types";
import type { Pedido } from "@/features/compras/types";

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function KPICard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PedidoRow({ pedido }: { pedido: Pedido }) {
  const statusCfg = STATUS_CONFIG[pedido.status];
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{pedido.titulo}</p>
        <p className="text-xs text-muted-foreground">
          {pedido.vendor?.name ?? "Sem fornecedor"}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-2 shrink-0">
        <span
          className="text-xs font-medium"
          style={{ color: prioridadeCfg.color }}
        >
          {prioridadeCfg.label}
        </span>
        <Badge variant={statusCfg.badge} className="text-xs">
          {statusCfg.label}
        </Badge>
        <span className="text-sm font-semibold tabular-nums">
          {formatCurrency(pedido.valor_estimado)}
        </span>
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
    const pendentes = pedidos.filter(
      (p) => p.status === "aguardando_aprovacao"
    ).length;

    const valorEmAprovacao = pedidos
      .filter((p) => p.status === "aguardando_aprovacao")
      .reduce((sum, p) => sum + (p.valor_estimado ?? 0), 0);

    const concluidosMes = pedidos.filter(
      (p) =>
        p.status === "concluido" &&
        p.data_solicitacao &&
        isWithinInterval(parseISO(p.data_solicitacao), {
          start: monthStart,
          end: monthEnd,
        })
    ).length;

    return { pendentes, valorEmAprovacao, concluidosMes };
  }, [pedidos, monthStart, monthEnd]);

  const recentPedidos = useMemo(
    () =>
      [...pedidos]
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        )
        .slice(0, 5),
    [pedidos]
  );

  const topVendors = useMemo(() => {
    const countMap = new Map<string, { name: string; count: number }>();
    for (const p of pedidos) {
      if (!p.vendor_id || !p.vendor) continue;
      const entry = countMap.get(p.vendor_id);
      if (entry) {
        entry.count++;
      } else {
        countMap.set(p.vendor_id, { name: p.vendor.name, count: 1 });
      }
    }
    return [...countMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [pedidos]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Compras & Fornecedores"
        description="Visão geral de pedidos, fornecedores e aprovações."
        actions={
          <Button onClick={() => setPedidoFormOpen(true)}>
            <IconPlus className="mr-1.5 size-4" />
            Novo Pedido
          </Button>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard
          title="Total Fornecedores"
          value={vendors.length}
          icon={IconTruck}
          description="fornecedores ativos"
          loading={loadingVendors}
        />
        <KPICard
          title="Pedidos Pendentes"
          value={kpis.pendentes}
          icon={IconClockHour4}
          description="aguardando aprovação"
          loading={loadingPedidos}
        />
        <KPICard
          title="Valor em Aprovação"
          value={formatCurrency(kpis.valorEmAprovacao)}
          icon={IconCurrencyDollar}
          description="em pedidos pendentes"
          loading={loadingPedidos}
        />
        <KPICard
          title="Concluídos este Mês"
          value={kpis.concluidosMes}
          icon={IconCircleCheck}
          description="pedidos finalizados"
          loading={loadingPedidos}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Pedidos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/compras/orcamentos">
                Ver todos <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingPedidos ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentPedidos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum pedido ainda.{" "}
                <button
                  className="underline"
                  onClick={() => setPedidoFormOpen(true)}
                >
                  Criar primeiro pedido
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                {recentPedidos.map((p) => (
                  <PedidoRow key={p.id} pedido={p} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Top Fornecedores</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/compras/fornecedores">
                Ver todos <IconArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingPedidos || loadingVendors ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topVendors.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum dado disponível ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {topVendors.map((v, idx) => (
                  <div
                    key={v.name}
                    className="flex items-center justify-between rounded-md border p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                    <Badge variant="secondary">{v.count} pedido{v.count !== 1 ? "s" : ""}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PedidoForm open={pedidoFormOpen} onOpenChange={setPedidoFormOpen} />
    </div>
  );
}
