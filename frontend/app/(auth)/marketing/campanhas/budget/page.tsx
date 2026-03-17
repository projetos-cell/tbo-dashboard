"use client";

// Feature #10 — Budget: tabela de itens com CRUD inline (categoria, planejado, realizado, fornecedor)

import { useState } from "react";
import {
  IconCurrencyDollar,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconReceipt,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useMarketingCampaigns,
  useCampaignBudget,
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
} from "@/features/marketing/hooks/use-marketing-campaigns";
import type { CampaignBudget } from "@/features/marketing/types/marketing";

const BUDGET_CATEGORIES = [
  "Mídia Paga",
  "Produção",
  "Design",
  "Influenciadores",
  "Eventos",
  "Tecnologia",
  "Agência",
  "Outros",
] as const;

function fmt(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseCents(value: string): number {
  const num = parseFloat(value.replace(",", "."));
  return isNaN(num) ? 0 : Math.round(num * 100);
}

interface EditableRow {
  category: string;
  description: string;
  planned_str: string;
  actual_str: string;
  vendor: string;
}

function AddRow({
  campaignId,
  onSaved,
}: {
  campaignId: string;
  onSaved: () => void;
}) {
  const createMutation = useCreateBudgetItem();
  const [row, setRow] = useState<EditableRow>({
    category: "Outros",
    description: "",
    planned_str: "",
    actual_str: "",
    vendor: "",
  });

  async function save() {
    await createMutation.mutateAsync({
      campaign_id: campaignId,
      category: row.category,
      description: row.description || null,
      planned: parseCents(row.planned_str),
      actual: parseCents(row.actual_str),
      vendor: row.vendor || null,
    });
    setRow({ category: "Outros", description: "", planned_str: "", actual_str: "", vendor: "" });
    onSaved();
  }

  return (
    <tr className="bg-muted/20">
      <td className="px-3 py-2">
        <Select value={row.category} onValueChange={(v) => setRow((r) => ({ ...r, category: v }))}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {BUDGET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <Input
          className="h-8 text-xs"
          placeholder="Descrição..."
          value={row.description}
          onChange={(e) => setRow((r) => ({ ...r, description: e.target.value }))}
        />
      </td>
      <td className="px-3 py-2">
        <Input
          className="h-8 text-xs text-right"
          placeholder="0,00"
          type="number"
          step="0.01"
          value={row.planned_str}
          onChange={(e) => setRow((r) => ({ ...r, planned_str: e.target.value }))}
        />
      </td>
      <td className="px-3 py-2">
        <Input
          className="h-8 text-xs text-right"
          placeholder="0,00"
          type="number"
          step="0.01"
          value={row.actual_str}
          onChange={(e) => setRow((r) => ({ ...r, actual_str: e.target.value }))}
        />
      </td>
      <td className="px-3 py-2">
        <Input
          className="h-8 text-xs"
          placeholder="Fornecedor..."
          value={row.vendor}
          onChange={(e) => setRow((r) => ({ ...r, vendor: e.target.value }))}
        />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={save}
          disabled={createMutation.isPending || !row.category}
          className="rounded p-1 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <IconCheck size={15} />
        </button>
      </td>
    </tr>
  );
}

function EditableRowComponent({
  item,
  campaignId,
  onCancel,
}: {
  item: CampaignBudget;
  campaignId: string;
  onCancel: () => void;
}) {
  const updateMutation = useUpdateBudgetItem();
  const [row, setRow] = useState<EditableRow>({
    category: item.category,
    description: item.description ?? "",
    planned_str: (item.planned / 100).toFixed(2),
    actual_str: (item.actual / 100).toFixed(2),
    vendor: item.vendor ?? "",
  });

  async function save() {
    await updateMutation.mutateAsync({
      id: item.id,
      campaignId,
      data: {
        category: row.category,
        description: row.description || null,
        planned: parseCents(row.planned_str),
        actual: parseCents(row.actual_str),
        vendor: row.vendor || null,
      },
    });
    onCancel();
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-3 py-2">
        <Select value={row.category} onValueChange={(v) => setRow((r) => ({ ...r, category: v }))}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {BUDGET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2">
        <Input className="h-8 text-xs" value={row.description} onChange={(e) => setRow((r) => ({ ...r, description: e.target.value }))} />
      </td>
      <td className="px-3 py-2">
        <Input className="h-8 text-xs text-right" type="number" step="0.01" value={row.planned_str} onChange={(e) => setRow((r) => ({ ...r, planned_str: e.target.value }))} />
      </td>
      <td className="px-3 py-2">
        <Input className="h-8 text-xs text-right" type="number" step="0.01" value={row.actual_str} onChange={(e) => setRow((r) => ({ ...r, actual_str: e.target.value }))} />
      </td>
      <td className="px-3 py-2">
        <Input className="h-8 text-xs" value={row.vendor} onChange={(e) => setRow((r) => ({ ...r, vendor: e.target.value }))} />
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-0.5">
          <button onClick={save} disabled={updateMutation.isPending} className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50">
            <IconCheck size={15} />
          </button>
          <button onClick={onCancel} className="rounded p-1 text-muted-foreground hover:bg-muted">
            <IconX size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function KPICard({ label, value, icon: Icon, color, isLoading }: { label: string; value: string; icon: React.ElementType; color: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2"><Icon className="size-4" style={{ color }} /><p className="text-xs text-muted-foreground">{label}</p></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function BudgetContent() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [showAddRow, setShowAddRow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignBudget | null>(null);

  const { data: campaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: budgetItems, isLoading: budgetLoading, error, refetch } = useCampaignBudget(
    selectedCampaignId || null,
  );
  const deleteMutation = useDeleteBudgetItem();

  const totalPlanned = (budgetItems ?? []).reduce((s, i) => s + i.planned, 0);
  const totalActual = (budgetItems ?? []).reduce((s, i) => s + i.actual, 0);
  const variance = totalPlanned - totalActual;
  const utilizationPct = totalPlanned > 0 ? ((totalActual / totalPlanned) * 100).toFixed(1) : "0";

  async function confirmDelete() {
    if (!deleteTarget || !selectedCampaignId) return;
    await deleteMutation.mutateAsync({ id: deleteTarget.id, campaignId: selectedCampaignId });
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget & ROI</h1>
          <p className="text-sm text-muted-foreground">Controle detalhado de orçamento por categoria e fornecedor.</p>
        </div>
        <Button onClick={() => setShowAddRow(true)} disabled={!selectedCampaignId || showAddRow}>
          <IconPlus className="mr-1 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      {/* Campaign selector */}
      <div className="max-w-sm">
        <Select value={selectedCampaignId} onValueChange={(v) => { setSelectedCampaignId(v); setShowAddRow(false); setEditingId(null); }}>
          <SelectTrigger>
            <SelectValue placeholder={campaignsLoading ? "Carregando..." : "Selecionar campanha..."} />
          </SelectTrigger>
          <SelectContent>
            {(campaigns ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs (sempre visíveis quando campanha selecionada) */}
      {selectedCampaignId && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KPICard label="Planejado" value={fmt(totalPlanned)} icon={IconCurrencyDollar} color="#3b82f6" isLoading={budgetLoading} />
          <KPICard label="Realizado" value={fmt(totalActual)} icon={IconReceipt} color="#f59e0b" isLoading={budgetLoading} />
          <KPICard label="Saldo" value={fmt(variance)} icon={IconCurrencyDollar} color={variance >= 0 ? "#22c55e" : "#ef4444"} isLoading={budgetLoading} />
          <KPICard label="Utilização" value={`${utilizationPct}%`} icon={IconTrendingUp} color="#8b5cf6" isLoading={budgetLoading} />
        </div>
      )}

      {/* Content */}
      {!selectedCampaignId ? (
        <EmptyState
          icon={IconCurrencyDollar}
          title="Selecione uma campanha"
          description="Escolha uma campanha para visualizar e gerenciar o budget detalhado."
        />
      ) : error ? (
        <ErrorState message="Erro ao carregar budget." onRetry={() => refetch()} />
      ) : budgetLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
      ) : (budgetItems ?? []).length === 0 && !showAddRow ? (
        <EmptyState
          icon={IconCurrencyDollar}
          title="Nenhum item de budget"
          description="Adicione itens para controlar gastos por categoria e fornecedor."
          cta={{ label: "Adicionar item", onClick: () => setShowAddRow(true) }}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-36">Categoria</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Descrição</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground w-28">Planejado</th>
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground w-28">Realizado</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-32">Fornecedor</th>
                <th className="px-3 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {(budgetItems ?? []).map((item) =>
                editingId === item.id ? (
                  <EditableRowComponent
                    key={item.id}
                    item={item}
                    campaignId={selectedCampaignId}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.description ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">{fmt(item.planned)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs">
                      <span className={item.actual > item.planned ? "text-destructive font-medium" : ""}>
                        {fmt(item.actual)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.vendor ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <IconEdit size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {showAddRow && (
                <AddRow
                  campaignId={selectedCampaignId}
                  onSaved={() => setShowAddRow(false)}
                />
              )}
            </tbody>

            {(budgetItems ?? []).length > 0 && (
              <tfoot className="bg-muted/30 border-t">
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-xs font-medium">Total</td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-semibold">{fmt(totalPlanned)}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                    <span className={totalActual > totalPlanned ? "text-destructive" : ""}>{fmt(totalActual)}</span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>

          {(budgetItems ?? []).length > 0 && !showAddRow && (
            <div className="border-t p-2">
              <button
                onClick={() => setShowAddRow(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconPlus size={13} /> Adicionar linha
              </button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              O item <strong>{deleteTarget?.category}</strong> — {deleteTarget?.description ?? "sem descrição"} será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <RequireRole module="marketing">
      <BudgetContent />
    </RequireRole>
  );
}
