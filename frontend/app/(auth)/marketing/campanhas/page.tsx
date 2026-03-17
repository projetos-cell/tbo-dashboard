"use client";

import { useState, useMemo } from "react";
import {
  IconPlus,
  IconSearch,
  IconSpeakerphone,
  IconTrash,
  IconX,
  IconCopy,
  IconDownload,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useMarketingCampaigns,
  useDeleteMarketingCampaign,
  useDuplicateMarketingCampaign,
  useToggleFavoriteCampaign,
} from "@/features/marketing/hooks/use-marketing-campaigns";
import { CampaignFormModal } from "@/features/marketing/components/campaigns/campaign-form-modal";
import { CampaignDetailDrawer } from "@/features/marketing/components/campaigns/campaign-detail-drawer";
import { CampaignTableSkeleton } from "@/features/marketing/components/campaigns/campaign-table-skeleton";
import { MARKETING_CAMPAIGN_STATUS } from "@/lib/constants";
import type { MarketingCampaign, MarketingCampaignStatus } from "@/features/marketing/types/marketing";

// ── Sub-components ───────────────────────────────────────────────────

function KPICard({ label, value, isLoading }: { label: string; value: string; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// Feature #5: Barra de progresso de budget
function BudgetBar({ budget, spent }: { budget: number | null; spent: number | null }) {
  if (!budget) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = Math.min(((spent ?? 0) / budget) * 100, 100);
  const isOver = (spent ?? 0) > budget;
  return (
    <div className="w-28 space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>R$ {((spent ?? 0) / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
        <span className={isOver ? "text-destructive" : ""}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Feature #4: Channel filter chips
function ChannelFilterChips({
  channels,
  selected,
  onToggle,
}: {
  channels: string[];
  selected: string[];
  onToggle: (ch: string) => void;
}) {
  if (channels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {channels.map((ch) => (
        <button
          key={ch}
          onClick={() => onToggle(ch)}
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border ${
            selected.includes(ch)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/60 text-muted-foreground border-muted hover:border-primary/40"
          }`}
        >
          {ch}
          {selected.includes(ch) && <IconX size={10} />}
        </button>
      ))}
    </div>
  );
}

// ── Main content ─────────────────────────────────────────────────────

function CampanhasContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketingCampaignStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  // Feature #70 — filtro de favoritos
  const [favoritosOnly, setFavoritosOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MarketingCampaign | null>(null);

  const { data: campaigns, isLoading, error, refetch } = useMarketingCampaigns();
  const deleteMutation = useDeleteMarketingCampaign();
  const duplicateMutation = useDuplicateMarketingCampaign();
  const favoriteMutation = useToggleFavoriteCampaign();

  // Deriva lista de canais únicos para o filtro
  const allChannels = useMemo(() => {
    const set = new Set<string>();
    (campaigns ?? []).forEach((c) => c.channels.forEach((ch) => set.add(ch)));
    return Array.from(set).sort();
  }, [campaigns]);

  const filtered = useMemo(
    () =>
      (campaigns ?? []).filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (channelFilter.length > 0 && !channelFilter.some((ch) => c.channels.includes(ch)))
          return false;
        // Feature #70 — filter by favorites
        if (favoritosOnly && !c.is_favorited) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      }),
    [campaigns, statusFilter, channelFilter, search, favoritosOnly],
  );

  const active = (campaigns ?? []).filter((c) => c.status === "ativa").length;
  const totalBudget = (campaigns ?? []).reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalSpent = (campaigns ?? []).reduce((s, c) => s + (c.spent ?? 0), 0);

  function toggleChannel(ch: string) {
    setChannelFilter((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function openDrawer(campaign: MarketingCampaign) {
    setSelectedCampaign(campaign);
    setDrawerOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  // Feature #14: Export CSV
  function exportCSV() {
    const headers = ["Nome", "Status", "Início", "Fim", "Budget (R$)", "Gasto (R$)", "Canais", "Tags"];
    const rows = filtered.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.status,
      c.start_date ? new Date(c.start_date).toLocaleDateString("pt-BR") : "",
      c.end_date ? new Date(c.end_date).toLocaleDateString("pt-BR") : "",
      c.budget != null ? (c.budget / 100).toFixed(2) : "",
      c.spent != null ? (c.spent / 100).toFixed(2) : "",
      `"${c.channels.join("; ")}"`,
      `"${c.tags.join("; ")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campanhas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanhas de Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Timeline de campanhas, briefings, peças e budget.
          </p>
        </div>
        <div className="flex gap-2">
          {(campaigns ?? []).length > 0 && (
            <Button variant="outline" onClick={exportCSV}>
              <IconDownload className="mr-1 h-4 w-4" /> Exportar CSV
            </Button>
          )}
          <Button onClick={() => setCreateOpen(true)}>
            <IconPlus className="mr-1 h-4 w-4" /> Nova Campanha
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Total" value={String(campaigns?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Ativas" value={String(active)} isLoading={isLoading} />
        <KPICard
          label="Budget total"
          value={`R$ ${(totalBudget / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          isLoading={isLoading}
        />
        <KPICard
          label="Gasto"
          value={`R$ ${(totalSpent / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as MarketingCampaignStatus | "all")}
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              {Object.entries(MARKETING_CAMPAIGN_STATUS).map(([key, def]) => (
                <TabsTrigger key={key} value={key}>
                  {def.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* Feature #70 — filtro de favoritos */}
          <button
            type="button"
            onClick={() => setFavoritosOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              favoritosOnly
                ? "border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-400"
                : "border-border text-muted-foreground hover:border-amber-300 hover:text-amber-500"
            }`}
          >
            {favoritosOnly ? (
              <IconStarFilled className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <IconStar className="h-3.5 w-3.5" />
            )}
            Favoritos
          </button>
          <div className="relative max-w-xs flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar campanhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Feature #4: Channel chips */}
        <ChannelFilterChips
          channels={allChannels}
          selected={channelFilter}
          onToggle={toggleChannel}
        />
        {channelFilter.length > 0 && (
          <button
            onClick={() => setChannelFilter([])}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Limpar filtro de canais
          </button>
        )}
      </div>

      {/* Table / States */}
      {error ? (
        <ErrorState message="Erro ao carregar campanhas." onRetry={() => refetch()} />
      ) : isLoading ? (
        // Feature #71 — Skeleton content-aware que reflete o layout real
        <CampaignTableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSpeakerphone}
          title={
            search || statusFilter !== "all" || channelFilter.length > 0
              ? "Nenhuma campanha encontrada"
              : "Nenhuma campanha ainda"
          }
          description={
            search || statusFilter !== "all" || channelFilter.length > 0
              ? "Ajuste os filtros para encontrar campanhas."
              : "Crie sua primeira campanha de marketing."
          }
          cta={
            !search && statusFilter === "all" && channelFilter.length === 0
              ? { label: "Nova campanha", onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Período
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Budget
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Canais
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((campaign) => {
                const statusDef =
                  MARKETING_CAMPAIGN_STATUS[campaign.status as MarketingCampaignStatus];
                return (
                  <tr
                    key={campaign.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openDrawer(campaign)}
                  >
                    {/* Feature #70 — star icon */}
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          favoriteMutation.mutate({
                            id: campaign.id,
                            is_favorited: !campaign.is_favorited,
                          })
                        }
                        className="rounded p-1 transition-colors hover:bg-amber-500/10"
                        title={campaign.is_favorited ? "Remover favorito" : "Favoritar"}
                      >
                        {campaign.is_favorited ? (
                          <IconStarFilled className="h-4 w-4 text-amber-500" />
                        ) : (
                          <IconStar className="h-4 w-4 text-muted-foreground/40 hover:text-amber-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {campaign.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {statusDef ? (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: statusDef.bg, color: statusDef.color }}
                        >
                          {statusDef.label}
                        </Badge>
                      ) : (
                        campaign.status
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {campaign.start_date
                        ? new Date(campaign.start_date).toLocaleDateString("pt-BR")
                        : "--"}
                      {campaign.end_date &&
                        ` → ${new Date(campaign.end_date).toLocaleDateString("pt-BR")}`}
                    </td>
                    {/* Feature #5: Budget bar */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <BudgetBar budget={campaign.budget} spent={campaign.spent} />
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {campaign.channels.slice(0, 3).map((ch) => (
                          <Badge key={ch} variant="outline" className="text-xs">
                            {ch}
                          </Badge>
                        ))}
                        {campaign.channels.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{campaign.channels.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {/* Feature #3 + #13: Delete + Duplicate actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => duplicateMutation.mutate(campaign)}
                          disabled={duplicateMutation.isPending}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          title="Duplicar campanha"
                        >
                          <IconCopy size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(campaign)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Excluir campanha"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "campanha" : "campanhas"}
          </div>
        </div>
      )}

      {/* Feature #1: Modal Nova Campanha */}
      <CampaignFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        campaign={null}
      />

      {/* Feature #2: Drawer de detalhe */}
      <CampaignDetailDrawer
        campaign={selectedCampaign}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCampaign(null);
        }}
      />

      {/* Feature #3: Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              A campanha <strong>{deleteTarget?.name}</strong> será excluída permanentemente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CampanhasPage() {
  return (
    <RequireRole module="marketing">
      <CampanhasContent />
    </RequireRole>
  );
}
