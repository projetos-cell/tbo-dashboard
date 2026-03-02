"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Settings } from "lucide-react";
import { PAYABLE_STATUS, RECEIVABLE_STATUS } from "@/lib/constants";
import { RequireRole } from "@/components/auth/require-role";
import { ErrorState, TabErrorBoundary } from "@/components/shared";
import { usePayablesState } from "@/hooks/use-payables-state";
import { useReceivablesState } from "@/hooks/use-receivables-state";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useFinancialRealtime } from "@/hooks/use-financial-realtime";

// Static imports — small/always-visible components
import { ExecutiveKPICards } from "@/components/financial/executive-kpis";
import { OmieSyncIndicator } from "@/components/financial/omie-sync-indicator";
import { BalanceSetupDialog } from "@/components/financial/balance-setup-dialog";
import { ValueMaskToggle } from "@/components/financial/value-mask-toggle";
import { InsightsPanel } from "@/components/financial/insights-panel";
import { FinFilters } from "@/components/financial/fin-filters";
import { PayablesTable } from "@/components/financial/payables-table";
import { ReceivablesTable } from "@/components/financial/receivables-table";
import { PayableDetail } from "@/components/financial/payable-detail";
import { ReceivableDetail } from "@/components/financial/receivable-detail";
import { PayableForm } from "@/components/financial/payable-form";
import { ReceivableForm } from "@/components/financial/receivable-form";
import { InboxAlerts } from "@/components/financial/inbox-alerts";

// Heavy: recharts-based chart components — lazy load, SSR disabled
const FinCharts = dynamic(
  () => import("@/components/financial/fin-charts").then((m) => ({ default: m.FinCharts })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const IntelligentCashFlow = dynamic(
  () => import("@/components/financial/intelligent-cash-flow").then((m) => ({ default: m.IntelligentCashFlow })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const EstrategicoTab = dynamic(
  () => import("@/components/financial/estrategico-tab").then((m) => ({ default: m.EstrategicoTab })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const ClientesTab = dynamic(
  () => import("@/components/financial/clientes-tab").then((m) => ({ default: m.ClientesTab })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const SimulacoesTab = dynamic(
  () => import("@/components/financial/simulacoes-tab").then((m) => ({ default: m.SimulacoesTab })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);

// Heavy tab content — lazy load (SSR ok, no browser APIs)
const ConciliacaoTab = dynamic(
  () => import("@/components/financial/conciliacao-tab").then((m) => ({ default: m.ConciliacaoTab })),
  {
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const CadastrosTab = dynamic(
  () => import("@/components/financial/cadastros-tab").then((m) => ({ default: m.CadastrosTab })),
  {
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const OmieSyncPanel = dynamic(
  () => import("@/components/financial/omie-sync-panel").then((m) => ({ default: m.OmieSyncPanel })),
  {
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
const FinImportDialog = dynamic(
  () => import("@/components/financial/fin-import-dialog").then((m) => ({ default: m.FinImportDialog })),
  {
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />,
  }
);

const PAYABLE_STATUS_OPTIONS = Object.entries(PAYABLE_STATUS).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

const RECEIVABLE_STATUS_OPTIONS = Object.entries(RECEIVABLE_STATUS).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export default function FinanceiroPage() {
  // UI state (simple toggles stay in the page)
  const [tab, setTab] = useState("dashboard");
  const [importOpen, setImportOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [valueMasked, setValueMasked] = useState(false);

  // Domain hooks
  const pay = usePayablesState();
  const rec = useReceivablesState();
  const fin = useFinancialData();

  // Realtime: auto-refresh on DB changes
  useFinancialRealtime();

  const primaryError = pay.error || rec.error;
  if (primaryError) {
    return (
      <RequireRole minRole="diretoria" module="financeiro">
        <ErrorState
          message={primaryError.message}
          onRetry={() => { pay.refetch(); rec.refetch(); }}
        />
      </RequireRole>
    );
  }

  return (
    <RequireRole minRole="diretoria" module="financeiro">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie contas a pagar, receber e fluxo de caixa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ValueMaskToggle masked={valueMasked} onToggle={setValueMasked} />
          <OmieSyncIndicator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBalanceOpen(true)}
            aria-label="Configurar saldo inicial"
          >
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Saldo Inicial
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            aria-label="Importar extrato bancário"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Importar OFX/CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
          <TabsTrigger value="estrategico">Estrategico</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="simulacoes">Simulacoes</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox
            {fin.alerts.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {fin.alerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliacao</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="omie">Omie</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Dashboard">
            <ExecutiveKPICards kpis={fin.executiveKpis} masked={valueMasked} />
            <InsightsPanel insights={fin.insights} />
            <FinCharts payables={fin.allPayables} receivables={fin.allReceivables} />
          </TabErrorBoundary>
        </TabsContent>

        {/* A Pagar */}
        <TabsContent value="pagar" className="space-y-4">
          <div className="flex items-center justify-between">
            <FinFilters
              search={pay.search}
              onSearchChange={pay.setSearch}
              status={pay.status}
              onStatusChange={pay.setStatus}
              statusOptions={PAYABLE_STATUS_OPTIONS}
            />
            <Button onClick={() => pay.setFormOpen(true)} className="ml-3 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Conta
            </Button>
          </div>
          <PayablesTable payables={pay.payables} onSelect={pay.handleSelect} />
        </TabsContent>

        {/* A Receber */}
        <TabsContent value="receber" className="space-y-4">
          <div className="flex items-center justify-between">
            <FinFilters
              search={rec.search}
              onSearchChange={rec.setSearch}
              status={rec.status}
              onStatusChange={rec.setStatus}
              statusOptions={RECEIVABLE_STATUS_OPTIONS}
            />
            <Button onClick={() => rec.setFormOpen(true)} className="ml-3 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Fatura
            </Button>
          </div>
          <ReceivablesTable receivables={rec.receivables} onSelect={rec.handleSelect} />
        </TabsContent>

        {/* Caixa — Intelligent Cash Flow */}
        <TabsContent value="caixa" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Caixa">
            <IntelligentCashFlow
              payables={fin.allPayables}
              receivables={fin.allReceivables}
              initialBalance={fin.initialBalance}
              masked={valueMasked}
            />
          </TabErrorBoundary>
        </TabsContent>

        {/* Estrategico */}
        <TabsContent value="estrategico" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Estrategico">
            <EstrategicoTab
              payables={fin.allPayables}
              receivables={fin.allReceivables}
              masked={valueMasked}
            />
          </TabErrorBoundary>
        </TabsContent>

        {/* Clientes */}
        <TabsContent value="clientes" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Clientes">
            <ClientesTab receivables={fin.allReceivables} masked={valueMasked} />
          </TabErrorBoundary>
        </TabsContent>

        {/* Simulacoes */}
        <TabsContent value="simulacoes" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Simulacoes">
            <SimulacoesTab
              payables={fin.allPayables}
              receivables={fin.allReceivables}
              initialBalance={fin.initialBalance}
              masked={valueMasked}
            />
          </TabErrorBoundary>
        </TabsContent>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Itens que precisam de atencao.
          </p>
          <InboxAlerts alerts={fin.alerts} />
        </TabsContent>

        {/* Conciliacao Bancaria */}
        <TabsContent value="conciliacao" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Conciliacao">
            <ConciliacaoTab />
          </TabErrorBoundary>
        </TabsContent>

        {/* Cadastros */}
        <TabsContent value="cadastros" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Cadastros">
            <CadastrosTab />
          </TabErrorBoundary>
        </TabsContent>

        {/* Omie Integration */}
        <TabsContent value="omie" className="space-y-4">
          <TabErrorBoundary fallbackLabel="Omie">
            <p className="text-sm text-muted-foreground">
              Sincronize fornecedores, clientes, contas a pagar e a receber com o Omie.
            </p>
            <OmieSyncPanel />
          </TabErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <PayableDetail
        payable={pay.selected}
        open={pay.detailOpen}
        onOpenChange={pay.setDetailOpen}
        onDelete={pay.handleDelete}
        onMarkPaid={pay.handleMarkPaid}
      />
      <ReceivableDetail
        receivable={rec.selected}
        open={rec.detailOpen}
        onOpenChange={rec.setDetailOpen}
        onDelete={rec.handleDelete}
        onMarkPaid={rec.handleMarkPaid}
      />

      {/* Forms */}
      <PayableForm open={pay.formOpen} onOpenChange={pay.setFormOpen} />
      <ReceivableForm open={rec.formOpen} onOpenChange={rec.setFormOpen} />

      {/* Dialogs */}
      <FinImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <BalanceSetupDialog open={balanceOpen} onOpenChange={setBalanceOpen} />
    </div>
    </RequireRole>
  );
}
