"use client";

// Features #6 + #7 — Briefing form + fluxo de aprovação com badge de status

import { useState } from "react";
import {
  IconFileText,
  IconPlus,
  IconEdit,
  IconSend,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useMarketingCampaigns,
  useCampaignBriefings,
  useUpdateCampaignBriefing,
} from "@/features/marketing/hooks/use-marketing-campaigns";
import { BriefingFormModal } from "@/features/marketing/components/campaigns/briefing-form-modal";
import type { CampaignBriefing } from "@/features/marketing/types/marketing";

const BRIEFING_STATUS: Record<CampaignBriefing["status"], { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  pending_approval: { label: "Aguardando Aprovação", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  revision: { label: "Em Revisão", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

function BriefingCard({
  briefing,
  onEdit,
  onUpdateStatus,
  isUpdating,
}: {
  briefing: CampaignBriefing;
  onEdit: (b: CampaignBriefing) => void;
  onUpdateStatus: (id: string, status: CampaignBriefing["status"]) => void;
  isUpdating: boolean;
}) {
  const statusDef = BRIEFING_STATUS[briefing.status];
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge style={{ backgroundColor: statusDef.bg, color: statusDef.color }} variant="secondary">
            {statusDef.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(briefing.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onEdit(briefing)} className="h-7 px-2">
          <IconEdit size={14} />
        </Button>
      </div>

      {briefing.objective && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Objetivo</p>
          <p className="text-sm">{briefing.objective}</p>
        </div>
      )}

      {briefing.target_audience && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Público-alvo</p>
          <p className="text-sm">{briefing.target_audience}</p>
        </div>
      )}

      {briefing.key_messages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mensagens-chave</p>
          <ul className="space-y-1">
            {briefing.key_messages.map((msg, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      {briefing.deliverables.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entregáveis</p>
          <div className="flex flex-wrap gap-1.5">
            {briefing.deliverables.map((d, i) => (
              <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Feature #7 — Approval actions */}
      <div className="flex gap-2 pt-1 border-t">
        {briefing.status === "draft" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(briefing.id, "pending_approval")}
          >
            <IconSend size={13} className="mr-1" /> Enviar para aprovação
          </Button>
        )}
        {briefing.status === "pending_approval" && (
          <>
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(briefing.id, "approved")}
            >
              <IconCheck size={13} className="mr-1" /> Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(briefing.id, "revision")}
            >
              <IconRefresh size={13} className="mr-1" /> Solicitar revisão
            </Button>
          </>
        )}
        {briefing.status === "revision" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(briefing.id, "pending_approval")}
          >
            <IconSend size={13} className="mr-1" /> Reenviar para aprovação
          </Button>
        )}
        {briefing.status === "approved" && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <IconCheck size={13} /> Briefing aprovado
          </p>
        )}
      </div>
    </div>
  );
}

function BriefingContent() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBriefing, setEditingBriefing] = useState<CampaignBriefing | null>(null);

  const { data: campaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: briefings, isLoading: briefingsLoading, error, refetch } = useCampaignBriefings(
    selectedCampaignId || null,
  );
  const updateMutation = useUpdateCampaignBriefing();

  const statusCounts = Object.fromEntries(
    Object.keys(BRIEFING_STATUS).map((k) => [
      k,
      (briefings ?? []).filter((b) => b.status === k).length,
    ]),
  );

  function handleEdit(b: CampaignBriefing) {
    setEditingBriefing(b);
    setFormOpen(true);
  }

  function handleUpdateStatus(id: string, status: CampaignBriefing["status"]) {
    if (!selectedCampaignId) return;
    updateMutation.mutate({ id, campaignId: selectedCampaignId, data: { status } });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Briefings de Campanha</h1>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie briefings com objetivo, público-alvo e mensagens-chave.
          </p>
        </div>
        <Button
          onClick={() => { setEditingBriefing(null); setFormOpen(true); }}
          disabled={!selectedCampaignId}
        >
          <IconPlus className="mr-1 h-4 w-4" /> Novo Briefing
        </Button>
      </div>

      {/* Campaign selector */}
      <div className="max-w-sm">
        <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
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

      {/* Status KPIs */}
      {selectedCampaignId && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(BRIEFING_STATUS).map(([key, def]) => (
            <div key={key} className="rounded-lg border bg-card p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full" style={{ backgroundColor: def.color }} />
                <p className="text-xs text-muted-foreground">{def.label}</p>
              </div>
              {briefingsLoading ? (
                <Skeleton className="h-7 w-8" />
              ) : (
                <p className="text-2xl font-bold">{statusCounts[key] ?? 0}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!selectedCampaignId ? (
        <EmptyState
          icon={IconFileText}
          title="Selecione uma campanha"
          description="Escolha uma campanha acima para visualizar ou criar briefings."
        />
      ) : error ? (
        <ErrorState message="Erro ao carregar briefings." onRetry={() => refetch()} />
      ) : briefingsLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      ) : (briefings ?? []).length === 0 ? (
        <EmptyState
          icon={IconFileText}
          title="Nenhum briefing criado"
          description="Crie o briefing desta campanha com objetivo, público-alvo e mensagens-chave."
          cta={{ label: "Criar briefing", onClick: () => { setEditingBriefing(null); setFormOpen(true); } }}
        />
      ) : (
        <div className="space-y-4">
          {(briefings ?? []).map((b) => (
            <BriefingCard
              key={b.id}
              briefing={b}
              onEdit={handleEdit}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      )}

      <BriefingFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingBriefing(null); }}
        campaignId={selectedCampaignId}
        briefing={editingBriefing}
      />
    </div>
  );
}

export default function BriefingPage() {
  return (
    <RequireRole module="marketing">
      <BriefingContent />
    </RequireRole>
  );
}
