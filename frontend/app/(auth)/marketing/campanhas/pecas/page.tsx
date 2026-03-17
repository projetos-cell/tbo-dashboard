"use client";

// Features #8 + #9 — Peças kanban por status + criar/editar modal

import { useState } from "react";
import { IconPuzzle, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
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
  useCampaignPieces,
  useDeleteCampaignPiece,
} from "@/features/marketing/hooks/use-marketing-campaigns";
import { PieceFormModal } from "@/features/marketing/components/campaigns/piece-form-modal";
import type { CampaignPiece } from "@/features/marketing/types/marketing";

const PIECE_STATUS: Record<
  CampaignPiece["status"],
  { label: string; color: string; bg: string }
> = {
  pendente: { label: "Pendente", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  em_producao: { label: "Em Produção", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  revisao: { label: "Revisão", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  aprovado: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  publicado: { label: "Publicado", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

const STATUS_ORDER: CampaignPiece["status"][] = [
  "pendente",
  "em_producao",
  "revisao",
  "aprovado",
  "publicado",
];

function PieceCard({
  piece,
  onEdit,
  onDelete,
}: {
  piece: CampaignPiece;
  onEdit: (p: CampaignPiece) => void;
  onDelete: (p: CampaignPiece) => void;
}) {
  const statusDef = PIECE_STATUS[piece.status];
  const isOverdue =
    piece.due_date && new Date(piece.due_date) < new Date() && piece.status !== "publicado";

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight">{piece.name}</p>
        <div className="flex shrink-0 gap-0.5">
          <button
            onClick={() => onEdit(piece)}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <IconEdit size={13} />
          </button>
          <button
            onClick={() => onDelete(piece)}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {piece.type}
        </Badge>
        {piece.assigned_to && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {piece.assigned_to}
          </span>
        )}
      </div>

      {piece.due_date && (
        <p className={`text-[10px] font-medium ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
          {isOverdue ? "⚠ " : ""}Prazo: {new Date(piece.due_date).toLocaleDateString("pt-BR")}
        </p>
      )}

      {piece.file_url && (
        <a
          href={piece.file_url}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Ver arquivo ↗
        </a>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  pieces,
  onAdd,
  onEdit,
  onDelete,
}: {
  status: CampaignPiece["status"];
  pieces: CampaignPiece[];
  onAdd: (status: CampaignPiece["status"]) => void;
  onEdit: (p: CampaignPiece) => void;
  onDelete: (p: CampaignPiece) => void;
}) {
  const def = PIECE_STATUS[status];
  return (
    <div className="flex flex-col min-w-[200px] max-w-[240px] flex-1">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full" style={{ backgroundColor: def.color }} />
          <span className="text-xs font-medium">{def.label}</span>
          <span className="text-xs text-muted-foreground">({pieces.length})</span>
        </div>
        <button
          onClick={() => onAdd(status)}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <IconPlus size={14} />
        </button>
      </div>
      <div
        className="flex-1 rounded-lg min-h-[200px] p-2 space-y-2"
        style={{ backgroundColor: def.bg }}
      >
        {pieces.map((p) => (
          <PieceCard key={p.id} piece={p} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function PecasContent() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPiece, setEditingPiece] = useState<CampaignPiece | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<CampaignPiece["status"]>("pendente");
  const [deleteTarget, setDeleteTarget] = useState<CampaignPiece | null>(null);

  const { data: campaigns, isLoading: campaignsLoading } = useMarketingCampaigns();
  const { data: pieces, isLoading: piecesLoading, error, refetch } = useCampaignPieces(
    selectedCampaignId || null,
  );
  const deleteMutation = useDeleteCampaignPiece();

  const piecesByStatus = STATUS_ORDER.reduce<Record<CampaignPiece["status"], CampaignPiece[]>>(
    (acc, status) => {
      acc[status] = (pieces ?? []).filter((p) => p.status === status);
      return acc;
    },
    { pendente: [], em_producao: [], revisao: [], aprovado: [], publicado: [] },
  );

  function openCreate(status: CampaignPiece["status"]) {
    setEditingPiece(null);
    setDefaultStatus(status);
    setFormOpen(true);
  }

  function openEdit(piece: CampaignPiece) {
    setEditingPiece(piece);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget || !selectedCampaignId) return;
    await deleteMutation.mutateAsync({ id: deleteTarget.id, campaignId: selectedCampaignId });
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peças & Entregas</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status de produção de cada peça da campanha.
          </p>
        </div>
        <Button onClick={() => openCreate("pendente")} disabled={!selectedCampaignId}>
          <IconPlus className="mr-1 h-4 w-4" /> Nova Peça
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

      {/* Content */}
      {!selectedCampaignId ? (
        <EmptyState
          icon={IconPuzzle}
          title="Selecione uma campanha"
          description="Escolha uma campanha para visualizar e gerenciar as peças de produção."
        />
      ) : error ? (
        <ErrorState message="Erro ao carregar peças." onRetry={() => refetch()} />
      ) : piecesLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex flex-col min-w-[200px] max-w-[240px] flex-1 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (pieces ?? []).length === 0 ? (
        <EmptyState
          icon={IconPuzzle}
          title="Nenhuma peça cadastrada"
          description="Adicione peças para acompanhar o progresso de produção."
          cta={{ label: "Nova peça", onClick: () => openCreate("pendente") }}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              pieces={piecesByStatus[status]}
              onAdd={openCreate}
              onEdit={openEdit}
              onDelete={(p) => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      <PieceFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingPiece(null); }}
        campaignId={selectedCampaignId}
        piece={editingPiece}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir peça?</AlertDialogTitle>
            <AlertDialogDescription>
              A peça <strong>{deleteTarget?.name}</strong> será excluída permanentemente.
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

export default function PecasPage() {
  return (
    <RequireRole module="marketing">
      <PecasContent />
    </RequireRole>
  );
}
