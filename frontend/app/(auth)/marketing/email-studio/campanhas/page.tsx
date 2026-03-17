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
import { useEmailCampaigns } from "@/features/marketing/hooks/use-email-studio";
import { EMAIL_CAMPAIGN_STATUS } from "@/lib/constants";
import type { EmailCampaignStatus } from "@/features/marketing/types/marketing";

function CampanhasContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmailCampaignStatus | "all">("all");
  const { data: campaigns, isLoading, error, refetch } = useEmailCampaigns();

  const filtered = (campaigns ?? []).filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanhas de Email</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie campanhas de email marketing.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Nova Campanha
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as EmailCampaignStatus | "all")}
        >
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {Object.entries(EMAIL_CAMPAIGN_STATUS).map(([key, def]) => (
              <TabsTrigger key={key} value={key}>{def.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar campanhas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconSpeakerphone}
          title={search || statusFilter !== "all" ? "Nenhuma campanha encontrada" : "Nenhuma campanha ainda"}
          description={
            search || statusFilter !== "all"
              ? "Tente ajustar os filtros."
              : "Crie sua primeira campanha de email."
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Assunto</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Agendado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((campaign) => {
                const statusDef = EMAIL_CAMPAIGN_STATUS[campaign.status as keyof typeof EMAIL_CAMPAIGN_STATUS];
                return (
                  <tr key={campaign.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{campaign.name}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell truncate max-w-xs">
                      {campaign.subject}
                    </td>
                    <td className="px-4 py-3">
                      {statusDef ? (
                        <Badge variant="secondary" style={{ backgroundColor: statusDef.bg, color: statusDef.color }}>
                          {statusDef.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{campaign.status}</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {campaign.scheduled_at
                        ? new Date(campaign.scheduled_at).toLocaleDateString("pt-BR")
                        : "--"}
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

export default function EmailStudioCampanhasPage() {
  return (
    <RequireRole module="marketing">
      <CampanhasContent />
    </RequireRole>
  );
}
