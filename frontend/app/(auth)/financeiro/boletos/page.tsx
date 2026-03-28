"use client";

// ── Boletos — página de gestão de boletos bancários ───────────────────────────
// RBACGuard: diretoria+. Listagem com status visual, geração de remessa,
// importação de arquivo retorno CNAB 400.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  IconRefresh,
  IconUpload,
  IconFileExport,
  IconSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  useBoletos,
  useBoletosSummary,
  useMarkRemessaSent,
  useUploadRetorno,
  useMarkOverdue,
} from "@/features/financeiro/hooks/use-boletos";
import { BoletosSummaryCards } from "@/features/financeiro/components/boletos-summary-cards";
import { BoletosTable } from "@/features/financeiro/components/boletos-table";
import type { BoletoFilters, BoletoStatus } from "@/lib/supabase/types/boletos";
import {
  generateRemessaFile,
} from "@/features/financeiro/services/boleto-generator";

// ── Main content ──────────────────────────────────────────────────────────────

function BoletosContent() {
  const [filters, setFilters] = useState<BoletoFilters>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: boletosResult, isLoading, refetch } = useBoletos({
    ...filters,
    search: search || undefined,
  });

  const { data: summary, isLoading: isLoadingSummary } = useBoletosSummary();
  const markRemessa = useMarkRemessaSent();
  const uploadRetorno = useUploadRetorno();
  const markOverdue = useMarkOverdue();

  const boletos = boletosResult?.data ?? [];

  // ── Remessa ─────────────────────────────────────────────────────────────────

  const handleGenerateRemessa = () => {
    const toExport = boletos.filter(
      (b) => selected.has(b.id) && b.status === "emitido" && !b.remessa_sent_at
    );
    if (toExport.length === 0) {
      toast.error("Selecione boletos emitidos que ainda não foram enviados em remessa.");
      return;
    }

    const remessaContent = generateRemessaFile(
      toExport.map((b) => ({
        nossoNumero: b.nosso_numero,
        barcode: b.barcode,
        dueDate: b.due_date,
        amount: b.amount,
        payerName: b.payer_name ?? "",
        payerDocument: b.payer_document ?? "",
        payerAddress: b.payer_address ?? "",
        instructions: b.instructions,
      })),
      {
        convenio: "0000001",  // configurar via env/settings
        agency: "0000",
        account: "00000000",
        carteira: "017",
        beneficiaryName: "TBO AGENCIA",
      }
    );

    const blob = new Blob([remessaContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `remessa_${new Date().toISOString().slice(0, 10)}.rem`;
    link.click();
    URL.revokeObjectURL(url);

    markRemessa.mutate(toExport.map((b) => b.id), {
      onSuccess: () => toast.success(`Remessa gerada com ${toExport.length} boleto(s).`),
      onError: (err) => toast.error(`Erro ao marcar remessa: ${err.message}`),
    });
    setSelected(new Set());
  };

  // ── Retorno ─────────────────────────────────────────────────────────────────

  const handleRetornoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadRetorno.mutate(file, {
      onSuccess: (result) =>
        toast.success(
          `Retorno processado: ${result.updated} atualizados, ${result.paid} pagos, ${result.skipped} não encontrados.`
        ),
      onError: (err) => toast.error(`Erro ao processar retorno: ${err.message}`),
    });
    e.target.value = "";
  };

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const setStatus = (value: string) =>
    setFilters((f) => ({
      ...f,
      status: value === "all" ? undefined : (value as BoletoStatus),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boletos</h1>
          <p className="text-sm text-muted-foreground">
            Geração e controle de cobranças via boleto bancário (BB CNAB 400).
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadRetorno.isPending}
          >
            <IconUpload className="size-3.5 mr-1.5" />
            Importar retorno
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ret,.txt"
            className="hidden"
            onChange={handleRetornoUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateRemessa}
            disabled={selected.size === 0 || markRemessa.isPending}
          >
            <IconFileExport className="size-3.5 mr-1.5" />
            Gerar remessa{selected.size > 0 ? ` (${selected.size})` : ""}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markOverdue.mutate(undefined, {
                onSuccess: (count) =>
                  count > 0
                    ? toast.info(`${count} boleto(s) marcados como vencidos.`)
                    : toast.success("Nenhum boleto vencido encontrado."),
              });
              void refetch();
            }}
            disabled={isLoading}
          >
            <IconRefresh className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <BoletosSummaryCards summary={summary} isLoading={isLoadingSummary} />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar pagador ou nosso nº..."
            className="pl-8 h-8 w-64 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select defaultValue="all" onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="emitido">Emitidos</SelectItem>
            <SelectItem value="pago">Pagos</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="h-8 w-36 text-sm"
          onChange={(e) =>
            setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))
          }
        />
        <Input
          type="date"
          className="h-8 w-36 text-sm"
          onChange={(e) =>
            setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))
          }
        />
      </div>

      {/* Table */}
      <BoletosTable
        boletos={boletos}
        isLoading={isLoading}
        selected={selected}
        onSelectionChange={setSelected}
      />

      {/* Count */}
      {!isLoading && boletosResult && (
        <p className="text-xs text-muted-foreground text-right">
          {boletosResult.count} boleto(s) encontrado(s)
        </p>
      )}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function BoletosPage() {
  return (
    <RBACGuard minRole="admin">
      <BoletosContent />
    </RBACGuard>
  );
}
