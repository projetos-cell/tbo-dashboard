"use client";

import { useState } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiscalSummaryCards } from "@/features/financeiro/components/fiscal-summary-cards";
import { NotasFiscaisTable } from "@/features/financeiro/components/notas-fiscais-table";
import {
  useNotasFiscais,
  useFiscalMonthlyReport,
  useTaxConfig,
} from "@/features/financeiro/hooks/use-fiscal";
import { fmt } from "@/features/financeiro/lib/formatters";
import type { NotaFiscalStatus } from "@/features/financeiro/services/fiscal-engine";
import {
  IconReceiptTax,
  IconSearch,
  IconFilter,
  IconSettings,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    months.push({ value, label });
  }
  return months;
}

// ── Tax Config Card ───────────────────────────────────────────────────────────

function TaxConfigCard() {
  const { data: config } = useTaxConfig();

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">
          Configuração fiscal
        </CardTitle>
        <Button variant="ghost" size="icon" className="size-7">
          <IconSettings className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {config ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-5">
            <div>
              <p className="text-xs text-muted-foreground">Regime</p>
              <p className="font-medium capitalize">
                {config.regime_tributario.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ISS</p>
              <p className="font-medium">{config.aliquota_iss}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">PIS/COFINS</p>
              <p className="font-medium">
                {config.aliquota_pis}% / {config.aliquota_cofins}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IR / CSLL</p>
              <p className="font-medium">
                {config.aliquota_ir}% / {config.aliquota_csll}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Simples</p>
              <Badge variant={config.optante_simples ? "default" : "secondary"}>
                {config.optante_simples ? "Sim" : "Não"}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Configuração fiscal não encontrada.{" "}
            <span className="text-primary cursor-pointer hover:underline">
              Configurar agora
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Relatório mensal ──────────────────────────────────────────────────────────

function RelatorioMensal({ competencia }: { competencia: string }) {
  const { data, isLoading, isError, refetch } = useFiscalMonthlyReport(competencia);

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <IconAlertCircle className="size-4" />
        Erro ao carregar relatório.
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <IconRefresh className="size-3.5 mr-1" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FiscalSummaryCards summary={data?.summary} isLoading={isLoading} />

      {data?.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Detalhamento de impostos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-sm">
              {(
                [
                  { label: "ISS", value: data.summary.valor_iss_total },
                  { label: "PIS", value: data.summary.valor_pis_total },
                  { label: "COFINS", value: data.summary.valor_cofins_total },
                  { label: "IR", value: data.summary.valor_ir_total },
                  { label: "CSLL", value: data.summary.valor_csll_total },
                ] as const
              ).map(({ label, value }) => (
                <div key={label} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold text-base">{fmt(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <NotasFiscaisTable
        notas={data?.notas ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}

// ── Lista com filtros ─────────────────────────────────────────────────────────

function ListaNotasFiscais() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<NotaFiscalStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useNotasFiscais({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    pageSize: 25,
  });

  const notas = data?.data ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por tomador, CNPJ ou número…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as NotaFiscalStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <IconFilter className="size-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
            <SelectItem value="autorizada">Autorizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
          </SelectContent>
        </Select>
        {isError && (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <IconRefresh className="size-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        )}
      </div>

      <NotasFiscaisTable notas={notas} isLoading={isLoading} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} nota{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="py-1 px-2 text-xs">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function FiscalContent() {
  const [tab, setTab] = useState<"relatorio" | "lista">("relatorio");
  const [competencia, setCompetencia] = useState(currentMonth());
  const months = monthOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconReceiptTax className="size-6 text-muted-foreground" />
            Motor Fiscal
          </h1>
          <p className="text-sm text-muted-foreground">
            Notas fiscais de serviço, cálculo de impostos e relatório fiscal mensal.
          </p>
        </div>

        {tab === "relatorio" && (
          <Select value={competencia} onValueChange={setCompetencia}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <TaxConfigCard />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="relatorio">Relatório mensal</TabsTrigger>
          <TabsTrigger value="lista">Todas as NFs</TabsTrigger>
        </TabsList>

        <TabsContent value="relatorio" className="mt-4">
          <RelatorioMensal competencia={competencia} />
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          <ListaNotasFiscais />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FiscalPage() {
  return (
    <RBACGuard minRole="diretoria">
      <FiscalContent />
    </RBACGuard>
  );
}
