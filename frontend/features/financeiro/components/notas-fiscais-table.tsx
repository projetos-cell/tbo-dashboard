"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt } from "@/features/financeiro/lib/formatters";
import type { NotaFiscal } from "@/features/financeiro/services/fiscal-engine";
import { useCancelarNotaFiscal } from "@/features/financeiro/hooks/use-fiscal";
import { toast } from "sonner";
import {
  IconDotsVertical,
  IconFilePencil,
  IconFileX,
  IconExternalLink,
} from "@tabler/icons-react";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  rascunho:     { label: "Rascunho",     variant: "secondary" },
  processando:  { label: "Processando",  variant: "outline" },
  autorizada:   { label: "Autorizada",   variant: "default" },
  cancelada:    { label: "Cancelada",    variant: "destructive" },
  rejeitada:    { label: "Rejeitada",    variant: "destructive" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABEL[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  notas: NotaFiscal[];
  isLoading?: boolean;
  onEdit?: (nf: NotaFiscal) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NotasFiscaisTable({ notas, isLoading, onEdit }: Props) {
  const [cancelTarget, setCancelTarget] = useState<NotaFiscal | null>(null);
  const [motivo, setMotivo] = useState("");
  const cancelMutation = useCancelarNotaFiscal();

  function handleCancelar() {
    if (!cancelTarget || !motivo.trim()) return;
    cancelMutation.mutate(
      { id: cancelTarget.id, motivo: motivo.trim() },
      {
        onSuccess: () => {
          toast.success("NF-e cancelada com sucesso.");
          setCancelTarget(null);
          setMotivo("");
        },
        onError: (err) => {
          toast.error(`Erro ao cancelar: ${(err as Error).message}`);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!notas.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma nota fiscal encontrada.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Emita a primeira NF-e para este período.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NF / Número</TableHead>
            <TableHead>Tomador</TableHead>
            <TableHead>Competência</TableHead>
            <TableHead className="text-right">Valor bruto</TableHead>
            <TableHead className="text-right">Impostos</TableHead>
            <TableHead className="text-right">Líquido</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {notas.map((nf) => (
            <TableRow key={nf.id}>
              <TableCell className="font-mono text-xs">
                {nf.numero ? `#${nf.numero}` : "—"}
                {nf.numero_rps && (
                  <span className="text-muted-foreground ml-1">
                    (RPS {nf.numero_rps})
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">
                  {nf.tomador_razao ?? "—"}
                </div>
                {(nf.tomador_cnpj ?? nf.tomador_cpf) && (
                  <div className="text-xs text-muted-foreground">
                    {nf.tomador_cnpj ?? nf.tomador_cpf}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {nf.data_competencia ?? nf.data_emissao?.slice(0, 7) ?? "—"}
              </TableCell>
              <TableCell className="text-right text-sm">
                {fmt(nf.valor_servicos)}
              </TableCell>
              <TableCell className="text-right text-sm text-orange-600">
                {fmt(nf.valor_total_impostos)}
                {nf.valor_total_impostos > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({((nf.valor_total_impostos / nf.valor_servicos) * 100).toFixed(1)}%)
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-green-700">
                {fmt(nf.valor_liquido)}
              </TableCell>
              <TableCell>
                <StatusBadge status={nf.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <IconDotsVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {nf.status === "rascunho" && onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(nf)}>
                        <IconFilePencil className="size-3.5 mr-2" />
                        Editar rascunho
                      </DropdownMenuItem>
                    )}
                    {nf.pdf_url && (
                      <DropdownMenuItem asChild>
                        <a href={nf.pdf_url} target="_blank" rel="noreferrer">
                          <IconExternalLink className="size-3.5 mr-2" />
                          Ver PDF
                        </a>
                      </DropdownMenuItem>
                    )}
                    {(nf.status === "autorizada" || nf.status === "rascunho") && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setCancelTarget(nf)}
                      >
                        <IconFileX className="size-3.5 mr-2" />
                        Cancelar NF-e
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Cancel dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setMotivo("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar NF-e</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="motivo-cancelamento">Motivo *</Label>
            <Input
              id="motivo-cancelamento"
              placeholder="Ex: Serviço não prestado, emissão duplicada…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              disabled={!motivo.trim() || cancelMutation.isPending}
              onClick={handleCancelar}
            >
              {cancelMutation.isPending ? "Cancelando…" : "Cancelar NF-e"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
