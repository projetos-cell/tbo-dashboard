"use client";

import { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingCampaigns } from "@/features/marketing/hooks/use-marketing-campaigns";
import { MARKETING_CAMPAIGN_STATUS } from "@/lib/constants";
import type { MarketingCampaignStatus } from "@/features/marketing/types/marketing";

function KPICard({ label, value, isLoading }: { label: string; value: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
  return <div className="rounded-lg border bg-card p-4 space-y-1"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}

function CampanhasContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketingCampaignStatus | "all">("all");
  const { data: campaigns, isLoading, error, refetch } = useMarketingCampaigns();

  const filtered = (campaigns ?? []).filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  const active = (campaigns ?? []).filter((c) => c.status === "ativa").length;
  const totalBudget = (campaigns ?? []).reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalSpent = (campaigns ?? []).reduce((s, c) => s + (c.spent ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanhas de Marketing</h1>
          <p className="text-sm text-muted-foreground">Timeline de campanhas, briefings, pecas e budget.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Total" value={String(campaigns?.length ?? 0)} isLoading={isLoading} />
        <KPICard label="Ativas" value={String(active)} isLoading={isLoading} />
        <KPICard label="Budget total" value={`R$ ${(totalBudget / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} isLoading={isLoading} />
        <KPICard label="Gasto" value={`R$ ${(totalSpent / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} isLoading={isLoading} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as MarketingCampaignStatus | "all")}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(MARKETING_CAMPAIGN_STATUS).map(([key, def]) => (
              <TabsTrigger key={key} value={key}>{def.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar campanhas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar campanhas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={IconSpeakerphone} title={search || statusFilter !== "all" ? "Nenhuma campanha encontrada" : "Nenhuma campanha ainda"} description={search || statusFilter !== "all" ? "Ajuste os filtros." : "Crie sua primeira campanha de marketing."} />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Periodo</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Budget</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Canais</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((campaign) => {
                const statusDef = MARKETING_CAMPAIGN_STATUS[campaign.status as MarketingCampaignStatus];
                return (
                  <tr key={campaign.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{campaign.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {statusDef ? <Badge variant="secondary" style={{ backgroundColor: statusDef.bg, color: statusDef.color }}>{statusDef.label}</Badge> : campaign.status}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString("pt-BR") : "--"}
                      {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString("pt-BR")}`}
                    </td>
                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      {campaign.budget != null ? `R$ ${(campaign.budget / 100).toLocaleString("pt-BR")}` : "--"}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {campaign.channels.slice(0, 3).map((ch) => (
                          <Badge key={ch} variant="outline" className="text-xs">{ch}</Badge>
                        ))}
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
