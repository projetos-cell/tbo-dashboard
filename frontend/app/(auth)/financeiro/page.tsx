"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Settings } from "lucide-react";
import {
  usePayables,
  useReceivables,
  useUpdatePayable,
  useDeletePayable,
  useUpdateReceivable,
  useDeleteReceivable,
  useLatestBalanceSnapshot,
  useFinClients,
  useCostCenters,
} from "@/hooks/use-financial";
import {
  computeExecutiveKPIs,
  computeInboxAlerts,
  computeInsights,
} from "@/services/financial";
import { PAYABLE_STATUS, RECEIVABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { RequireRole } from "@/components/auth/require-role";
import { ErrorState } from "@/components/shared";

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

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

const PAYABLE_STATUS_OPTIONS = Object.entries(PAYABLE_STATUS).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

const RECEIVABLE_STATUS_OPTIONS = Object.entries(RECEIVABLE_STATUS).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export default function FinanceiroPage() {
  const [tab, setTab] = useState("dashboard");

  // Payables state
  const [paySearch, setPaySearch] = useState("");
  const [payStatus, setPayStatus] = useState("all");
  const [selectedPayable, setSelectedPayable] = useState<PayableRow | null>(
    null
  );
  const [payDetailOpen, setPayDetailOpen] = useState(false);
  const [payFormOpen, setPayFormOpen] = useState(false);

  // Receivables state
  const [recSearch, setRecSearch] = useState("");
  const [recStatus, setRecStatus] = useState("all");
  const [selectedReceivable, setSelectedReceivable] =
    useState<ReceivableRow | null>(null);
  const [recDetailOpen, setRecDetailOpen] = useState(false);
  const [recFormOpen, setRecFormOpen] = useState(false);

  // Import, balance & masking state
  const [importOpen, setImportOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [valueMasked, setValueMasked] = useState(false);

  // Queries
  const { data: payables = [], error: payError, refetch: refetchPay } = usePayables({
    status: payStatus !== "all" ? payStatus : undefined,
    search: paySearch || undefined,
  });
  const { data: receivables = [], error: recError, refetch: refetchRec } = useReceivables({
    status: recStatus !== "all" ? recStatus : undefined,
    search: recSearch || undefined,
  });

  // Mutations
  const updatePay = useUpdatePayable();
  const deletePay = useDeletePayable();
  const updateRec = useUpdateReceivable();
  const deleteRec = useDeleteReceivable();

  // KPIs (computed from all data — fetch without status filter)
  const { data: allPayables = [] } = usePayables();
  const { data: allReceivables = [] } = useReceivables();
  const { data: balanceSnapshot } = useLatestBalanceSnapshot();
  const { data: clients = [] } = useFinClients();
  const { data: costCenters = [] } = useCostCenters();

  const initialBalance = balanceSnapshot?.balance ?? 0;

  const executiveKpis = useMemo(
    () => computeExecutiveKPIs(allPayables, allReceivables, initialBalance),
    [allPayables, allReceivables, initialBalance]
  );

  const alerts = useMemo(
    () => computeInboxAlerts(allPayables, allReceivables),
    [allPayables, allReceivables]
  );

  const insights = useMemo(
    () =>
      computeInsights(
        allPayables,
        allReceivables,
        clients,
        costCenters,
        initialBalance
      ),
    [allPayables, allReceivables, clients, costCenters, initialBalance]
  );

  // Handlers
  function handleSelectPayable(p: PayableRow) {
    setSelectedPayable(p);
    setPayDetailOpen(true);
  }

  function handleMarkPayablePaid(id: string) {
    updatePay.mutate(
      { id, updates: { status: "pago" } },
      { onSuccess: () => setPayDetailOpen(false) }
    );
  }

  function handleDeletePayable(id: string) {
    deletePay.mutate(id, { onSuccess: () => setPayDetailOpen(false) });
  }

  function handleSelectReceivable(r: ReceivableRow) {
    setSelectedReceivable(r);
    setRecDetailOpen(true);
  }

  function handleMarkReceivablePaid(id: string) {
    updateRec.mutate(
      { id, updates: { status: "pago" } },
      { onSuccess: () => setRecDetailOpen(false) }
    );
  }

  function handleDeleteReceivable(id: string) {
    deleteRec.mutate(id, { onSuccess: () => setRecDetailOpen(false) });
  }

  const primaryError = payError || recError;
  if (primaryError) {
    return (
      <RequireRole minRole="diretoria" module="financeiro">
        <ErrorState
          message={primaryError.message}
          onRetry={() => { refetchPay(); refetchRec(); }}
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
            {alerts.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliacao</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="omie">Omie</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <ExecutiveKPICards kpis={executiveKpis} masked={valueMasked} />
          <InsightsPanel insights={insights} />
          <FinCharts payables={allPayables} receivables={allReceivables} />
        </TabsContent>

        {/* A Pagar */}
        <TabsContent value="pagar" className="space-y-4">
          <div className="flex items-center justify-between">
            <FinFilters
              search={paySearch}
              onSearchChange={setPaySearch}
              status={payStatus}
              onStatusChange={setPayStatus}
              statusOptions={PAYABLE_STATUS_OPTIONS}
            />
            <Button onClick={() => setPayFormOpen(true)} className="ml-3 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Conta
            </Button>
          </div>
          <PayablesTable payables={payables} onSelect={handleSelectPayable} />
        </TabsContent>

        {/* A Receber */}
        <TabsContent value="receber" className="space-y-4">
          <div className="flex items-center justify-between">
            <FinFilters
              search={recSearch}
              onSearchChange={setRecSearch}
              status={recStatus}
              onStatusChange={setRecStatus}
              statusOptions={RECEIVABLE_STATUS_OPTIONS}
            />
            <Button onClick={() => setRecFormOpen(true)} className="ml-3 shrink-0">
              <Plus className="mr-1.5 h-4 w-4" />
              Nova Fatura
            </Button>
          </div>
          <ReceivablesTable
            receivables={receivables}
            onSelect={handleSelectReceivable}
          />
        </TabsContent>

        {/* Caixa — Intelligent Cash Flow */}
        <TabsContent value="caixa" className="space-y-4">
          <IntelligentCashFlow
            payables={allPayables}
            receivables={allReceivables}
            initialBalance={initialBalance}
            masked={valueMasked}
          />
        </TabsContent>

        {/* Estrategico (was Margens) */}
        <TabsContent value="estrategico" className="space-y-4">
          <EstrategicoTab
            payables={allPayables}
            receivables={allReceivables}
            masked={valueMasked}
          />
        </TabsContent>

        {/* Clientes */}
        <TabsContent value="clientes" className="space-y-4">
          <ClientesTab
            receivables={allReceivables}
            masked={valueMasked}
          />
        </TabsContent>

        {/* Simulacoes */}
        <TabsContent value="simulacoes" className="space-y-4">
          <SimulacoesTab
            payables={allPayables}
            receivables={allReceivables}
            initialBalance={initialBalance}
            masked={valueMasked}
          />
        </TabsContent>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Itens que precisam de atencao.
          </p>
          <InboxAlerts alerts={alerts} />
        </TabsContent>

        {/* Conciliacao Bancaria */}
        <TabsContent value="conciliacao" className="space-y-4">
          <ConciliacaoTab />
        </TabsContent>

        {/* Cadastros */}
        <TabsContent value="cadastros" className="space-y-4">
          <CadastrosTab />
        </TabsContent>

        {/* Omie Integration */}
        <TabsContent value="omie" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sincronize fornecedores, clientes, contas a pagar e a receber com o Omie.
          </p>
          <OmieSyncPanel />
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <PayableDetail
        payable={selectedPayable}
        open={payDetailOpen}
        onOpenChange={setPayDetailOpen}
        onDelete={handleDeletePayable}
        onMarkPaid={handleMarkPayablePaid}
      />
      <ReceivableDetail
        receivable={selectedReceivable}
        open={recDetailOpen}
        onOpenChange={setRecDetailOpen}
        onDelete={handleDeleteReceivable}
        onMarkPaid={handleMarkReceivablePaid}
      />

      {/* Forms */}
      <PayableForm open={payFormOpen} onOpenChange={setPayFormOpen} />
      <ReceivableForm open={recFormOpen} onOpenChange={setRecFormOpen} />

      {/* Dialogs */}
      <FinImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <BalanceSetupDialog open={balanceOpen} onOpenChange={setBalanceOpen} />
    </div>
    </RequireRole>
  );
}
