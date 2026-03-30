"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { IconEdit, IconCalendar, IconBuilding, IconUser } from "@tabler/icons-react";
import { usePedido, useAprovacoes } from "../hooks/use-compras";
import { PedidoItensEditor } from "./pedido-itens-editor";
import { PedidoForm } from "./pedido-form";
import { STATUS_CONFIG, PRIORIDADE_CONFIG, DECISAO_CONFIG } from "../types";
import type { Pedido } from "../types";

function formatCurrency(val: number | null) {
  if (val === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}

interface PedidoDetailSheetProps {
  pedidoId: string | null;
  onClose: () => void;
}

function AprovacoesList({ pedidoId }: { pedidoId: string }) {
  const { data: aprovacoes = [], isLoading } = useAprovacoes(pedidoId);

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (aprovacoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma aprovação registrada.</p>
    );
  }

  return (
    <div className="space-y-2">
      {aprovacoes.map((apr) => {
        const cfg = DECISAO_CONFIG[apr.decisao];
        return (
          <div key={apr.id} className="rounded-md border p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(apr.created_at ?? null)}
              </span>
            </div>
            {apr.comentario && (
              <p className="text-sm text-muted-foreground">{apr.comentario}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PedidoDetailContent({ pedido }: { pedido: Pedido }) {
  const [editOpen, setEditOpen] = useState(false);
  const statusCfg = STATUS_CONFIG[pedido.status];
  const prioridadeCfg = PRIORIDADE_CONFIG[pedido.prioridade];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusCfg.badge}>{statusCfg.label}</Badge>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${prioridadeCfg.color}20`,
                color: prioridadeCfg.color,
              }}
            >
              {prioridadeCfg.label}
            </span>
          </div>
          <p className="text-xl font-semibold">{pedido.titulo}</p>
          {pedido.descricao && (
            <p className="text-sm text-muted-foreground">{pedido.descricao}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="shrink-0"
        >
          <IconEdit className="mr-1.5 size-4" />
          Editar
        </Button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconBuilding className="size-4 shrink-0" />
          <span className="font-medium text-foreground">
            {pedido.vendor?.name ?? "Sem fornecedor"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconCalendar className="size-4 shrink-0" />
          <span>
            Necessidade: <span className="text-foreground">{formatDate(pedido.data_necessidade)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconUser className="size-4 shrink-0" />
          <span>
            Solicitado em: <span className="text-foreground">{formatDate(pedido.data_solicitacao)}</span>
          </span>
        </div>
        {pedido.data_aprovacao && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconCalendar className="size-4 shrink-0" />
            <span>
              Aprovado em: <span className="text-foreground">{formatDate(pedido.data_aprovacao)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
        <div>
          <p className="text-xs text-muted-foreground">Valor Estimado</p>
          <p className="text-lg font-semibold">{formatCurrency(pedido.valor_estimado)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Valor Final</p>
          <p className="text-lg font-semibold">{formatCurrency(pedido.valor_final)}</p>
        </div>
      </div>

      <Separator />

      {/* Itens */}
      <PedidoItensEditor pedidoId={pedido.id} />

      <Separator />

      {/* Aprovacoes */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Histórico de Aprovações</p>
        <AprovacoesList pedidoId={pedido.id} />
      </div>

      {pedido.notes && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm font-medium">Observações</p>
            <p className="text-sm text-muted-foreground">{pedido.notes}</p>
          </div>
        </>
      )}

      <PedidoForm
        open={editOpen}
        onOpenChange={setEditOpen}
        pedido={pedido}
      />
    </div>
  );
}

export function PedidoDetailSheet({ pedidoId, onClose }: PedidoDetailSheetProps) {
  const { data: pedido, isLoading } = usePedido(pedidoId ?? undefined);

  return (
    <Sheet open={!!pedidoId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Pedido</SheetTitle>
          <SheetDescription>Visualize e edite todos os dados do pedido.</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : pedido ? (
            <PedidoDetailContent pedido={pedido} />
          ) : (
            <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
