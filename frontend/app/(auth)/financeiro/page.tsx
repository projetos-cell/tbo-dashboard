"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  usePayables,
  useReceivables,
  useUpdatePayable,
  useDeletePayable,
  useUpdateReceivable,
  useDeleteReceivable,
} from "@/hooks/use-financial";
import {
  computeFinancialKPIs,
  computeCashFlow,
  computeInboxAlerts,
} from "@/services/financial";
import { PAYABLE_STATUS, RECEIVABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { RequireRole } from "@/components/auth/require-role";

import { FinKPICards } from "@/components/financial/fin-kpis";
import { FinFilters } from "@/components/financial/fin-filters";
import { PayablesTable } from "@/components/financial/payables-table";
import { ReceivablesTable } from "@/components/financial/receivables-table";
import { PayableDetail } from "@/components/financial/payable-detail";
import { ReceivableDetail } from "@/components/financial/receivable-detail";
import { PayableForm } from "@/components/financial/payable-form";
import { ReceivableForm } from "@/components/financial/receivable-form";
import { CashFlowTable } from "@/components/financial/cash-flow-table";
import { InboxAlerts } from "@/components/financial/inbox-alerts";

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

  // Queries
  const { data: payables = [] } = usePayables({
    status: payStatus !== "all" ? payStatus : undefined,
    search: paySearch || undefined,
  });
  const { data: receivables = [] } = useReceivables({
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

  const kpis = useMemo(
    () => computeFinancialKPIs(allPayables, allReceivables),
    [allPayables, allReceivables]
  );

  const cashFlow = useMemo(
    () => computeCashFlow(allPayables, allReceivables, 30),
    [allPayables, allReceivables]
  );

  const alerts = useMemo(
    () => computeInboxAlerts(allPayables, allReceivables),
    [allPayables, allReceivables]
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

  return (
    <RequireRole allowed={["admin"]} module="financeiro">
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contas a pagar, receber e fluxo de caixa.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="caixa">Caixa</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox
            {alerts.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <FinKPICards kpis={kpis} />
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

        {/* Caixa */}
        <TabsContent value="caixa" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Fluxo de caixa projetado para os próximos 30 dias.
          </p>
          <CashFlowTable days={cashFlow} />
        </TabsContent>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Itens que precisam de atenção.
          </p>
          <InboxAlerts alerts={alerts} />
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
    </div>
    </RequireRole>
  );
}
