"use client";

import { useState } from "react";
import type { Boleto, BoletoStatus } from "@/lib/supabase/types/boletos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconBan,
  IconCopy,
  IconFileDownload,
} from "@tabler/icons-react";
import { fmt } from "@/features/financeiro/lib/formatters";
import { useCancelBoleto } from "@/features/financeiro/hooks/use-boletos";
import { toast } from "sonner";

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BoletoStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  emitido:    { label: "Emitido",    variant: "secondary" },
  pago:       { label: "Pago",       variant: "default" },
  vencido:    { label: "Vencido",    variant: "destructive" },
  cancelado:  { label: "Cancelado",  variant: "outline" },
  substituido:{ label: "Substituído",variant: "outline" },
};

// ── Row actions ───────────────────────────────────────────────────────────────

function BoletoActions({ boleto }: { boleto: Boleto }) {
  const cancelMutation = useCancelBoleto();

  const handleCopy = () => {
    void navigator.clipboard.writeText(boleto.digitable_line);
    toast.success("Linha digitável copiada");
  };

  const handleCancel = () => {
    if (!confirm("Cancelar este boleto?")) return;
    cancelMutation.mutate(boleto.id, {
      onSuccess: () => toast.success("Boleto cancelado"),
      onError: (err) => toast.error(`Erro ao cancelar: ${err.message}`),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <IconDotsVertical className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <IconCopy className="size-3.5 mr-2" />
          Copiar linha digitável
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-muted-foreground"
          disabled
        >
          <IconFileDownload className="size-3.5 mr-2" />
          Baixar PDF (em breve)
        </DropdownMenuItem>
        {boleto.status === "emitido" && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            <IconBan className="size-3.5 mr-2" />
            Cancelar boleto
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Table skeleton ────────────────────────────────────────────────────────────

function BoletosTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function BoletosEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
      <IconFileDownload className="size-10 text-muted-foreground/30" />
      <p className="text-sm font-medium">Nenhum boleto encontrado</p>
      <p className="text-xs text-muted-foreground">
        Gere o primeiro boleto clicando em &quot;Gerar boleto&quot; acima.
      </p>
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

interface Props {
  boletos: Boleto[];
  isLoading: boolean;
  selected: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function BoletosTable({ boletos, isLoading, selected, onSelectionChange }: Props) {
  if (isLoading) return <BoletosTableSkeleton />;
  if (boletos.length === 0) return <BoletosEmpty />;

  const toggleAll = () => {
    if (selected.size === boletos.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(boletos.map((b) => b.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <input
                type="checkbox"
                className="rounded"
                checked={selected.size === boletos.length && boletos.length > 0}
                onChange={toggleAll}
              />
            </TableHead>
            <TableHead>Pagador</TableHead>
            <TableHead>Nosso Nº</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pago em</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {boletos.map((boleto) => {
            const cfg = STATUS_CONFIG[boleto.status];
            return (
              <TableRow key={boleto.id} className={boleto.status === "vencido" ? "bg-red-50/50" : ""}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.has(boleto.id)}
                    onChange={() => toggleOne(boleto.id)}
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-sm truncate max-w-[180px]">
                    {boleto.payer_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {boleto.payer_document ?? ""}
                  </p>
                </TableCell>
                <TableCell className="font-mono text-xs">{boleto.nosso_numero}</TableCell>
                <TableCell className="text-sm">
                  {new Date(boleto.due_date + "T12:00:00Z").toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {fmt(boleto.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={cfg.variant} className="text-xs">
                    {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {boleto.paid_at
                    ? new Date(boleto.paid_at).toLocaleDateString("pt-BR")
                    : "—"}
                </TableCell>
                <TableCell>
                  <BoletoActions boleto={boleto} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
