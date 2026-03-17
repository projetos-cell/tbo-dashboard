"use client";

// Feature #32 — Briefs listagem com KPIs (total, aprovados, em revisão)
// Feature #33 — Modal criar/editar brief
// Feature #34 — Fluxo aprovação (draft→revisão→aprovado) com feedback

import { useState } from "react";
import {
  IconFileText,
  IconPlus,
  IconSearch,
  IconCheck,
  IconRefresh,
  IconSend,
  IconPencil,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useContentBriefs,
  useUpdateContentBrief,
} from "@/features/marketing/hooks/use-marketing-content";
import { BriefFormModal } from "@/features/marketing/components/content/brief-form-modal";
import type { ContentBrief } from "@/features/marketing/types/marketing";

const BRIEF_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Rascunho", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  revision: { label: "Em revisão", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  cancelled: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

interface KpiCardProps {
  label: string;
  value: number;
  color?: string;
}

function KpiCard({ label, value, color }: KpiCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="p-4 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold" style={color ? { color } : undefined}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

interface ApprovalDialogState {
  brief: ContentBrief;
  action: "submit" | "approve" | "revision";
}

function BriefsContent() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrief, setEditBrief] = useState<ContentBrief | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<ApprovalDialogState | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data: briefs, isLoading, error, refetch } = useContentBriefs();
  const updateMutation = useUpdateContentBrief();

  const filtered = (briefs ?? []).filter((b) => {
    if (!search) return true;
    return b.title.toLowerCase().includes(search.toLowerCase());
  });

  // KPIs
  const total = (briefs ?? []).length;
  const approved = (briefs ?? []).filter((b) => b.status === "approved").length;
  const inRevision = (briefs ?? []).filter((b) => b.status === "revision").length;

  const handleApprovalConfirm = () => {
    if (!approvalDialog) return;
    const { brief, action } = approvalDialog;
    const nextStatus: ContentBrief["status"] =
      action === "submit" ? "revision" : action === "approve" ? "approved" : "revision";

    updateMutation.mutate({
      id: brief.id,
      data: { status: nextStatus },
    });
    setApprovalDialog(null);
    setFeedback("");
  };

  const openEdit = (brief: ContentBrief) => {
    setEditBrief(brief);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Briefs de Conteúdo</h1>
          <p className="text-sm text-muted-foreground">Briefings para produção de conteúdo.</p>
        </div>
        <Button onClick={() => { setEditBrief(null); setModalOpen(true); }}>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Brief
        </Button>
      </div>

      {/* KPI cards */}
      {!isLoading && (
        <div className="flex gap-3">
          <KpiCard label="Total" value={total} />
          <KpiCard label="Aprovados" value={approved} color="#22c55e" />
          <KpiCard label="Em revisão" value={inRevision} color="#f59e0b" />
          <KpiCard label="Rascunhos" value={total - approved - inRevision} />
        </div>
      )}
      {isLoading && (
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 flex-1 rounded-xl" />
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar briefs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message="Erro ao carregar briefs." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconFileText}
          title={search ? "Nenhum brief encontrado" : "Nenhum brief ainda"}
          description={search ? "Tente ajustar a busca." : "Crie o primeiro brief de conteúdo."}
          cta={{ label: "Novo Brief", onClick: () => { setEditBrief(null); setModalOpen(true); } }}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Título</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Público-alvo
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Prazo
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((brief) => {
                const st = BRIEF_STATUS[brief.status];
                return (
                  <tr key={brief.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {brief.title}
                      {brief.key_messages.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {brief.key_messages.join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {brief.target_audience ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {brief.deadline
                        ? new Date(brief.deadline).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {st ? (
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {st.label}
                        </Badge>
                      ) : (
                        brief.status
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => openEdit(brief)}
                          title="Editar"
                        >
                          <IconPencil className="h-3.5 w-3.5" />
                        </Button>
                        {/* Approval flow */}
                        {brief.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => setApprovalDialog({ brief, action: "submit" })}
                          >
                            <IconSend className="mr-1 h-3 w-3" /> Enviar
                          </Button>
                        )}
                        {brief.status === "revision" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => setApprovalDialog({ brief, action: "approve" })}
                          >
                            <IconCheck className="mr-1 h-3 w-3" /> Aprovar
                          </Button>
                        )}
                        {brief.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => setApprovalDialog({ brief, action: "revision" })}
                          >
                            <IconRefresh className="mr-1 h-3 w-3" /> Revisar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar */}
      <BriefFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditBrief(null); }}
        brief={editBrief}
      />

      {/* Approval confirmation dialog */}
      <AlertDialog
        open={!!approvalDialog}
        onOpenChange={(v) => { if (!v) { setApprovalDialog(null); setFeedback(""); } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalDialog?.action === "submit" && "Enviar para aprovação?"}
              {approvalDialog?.action === "approve" && "Aprovar brief?"}
              {approvalDialog?.action === "revision" && "Solicitar revisão?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalDialog?.action === "submit" &&
                "O brief será enviado para revisão e aprovação."}
              {approvalDialog?.action === "approve" &&
                "O brief será marcado como aprovado e estará pronto para produção."}
              {approvalDialog?.action === "revision" &&
                "O brief voltará para revisão."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(approvalDialog?.action === "approve" || approvalDialog?.action === "revision") && (
            <div className="space-y-2 py-2">
              <p className="text-sm font-medium">Feedback (opcional)</p>
              <Textarea
                placeholder="Adicione um comentário..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprovalConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function BriefsPage() {
  return (
    <RequireRole module="marketing">
      <BriefsContent />
    </RequireRole>
  );
}
