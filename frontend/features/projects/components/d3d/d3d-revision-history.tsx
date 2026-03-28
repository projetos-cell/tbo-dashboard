"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconHistory,
  IconPhoto,
  IconGitCompare,
  IconUpload,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared";
import {
  useStageRevisions,
  useCreateStageRevision,
  useUpdateRevisionStatus,
} from "@/features/projects/hooks/use-d3d-enhanced";
import { D3DRevisionReviewDialog } from "./d3d-revision-review-dialog";
import { D3DRevisionCard } from "./d3d-revision-card";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { format } from "date-fns";
import type { D3DStageRevision, RevisionStatus } from "@/features/projects/services/d3d-enhancements";

interface D3DRevisionHistoryProps {
  stageId: string;
  flowId: string;
  tenantId: string;
  canManage?: boolean;
}

export function D3DRevisionHistory({
  stageId,
  flowId,
  tenantId,
  canManage = true,
}: D3DRevisionHistoryProps) {
  const user = useAuthStore((s) => s.user);
  const { data: revisions = [], isLoading } = useStageRevisions(stageId);
  const createRevision = useCreateStageRevision();
  const updateStatus = useUpdateRevisionStatus(stageId);

  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{
    revision: D3DStageRevision;
    status: RevisionStatus;
  } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const revisionA = revisions.find((r) => r.id === compareA);
  const revisionB = revisions.find((r) => r.id === compareB);

  function handleAddRevision() {
    createRevision.mutate(
      {
        tenant_id: tenantId,
        flow_id: flowId,
        stage_id: stageId,
        image_url: addImageUrl.trim() || null,
        notes: addNotes.trim() || null,
        submitted_by: user?.user_metadata?.name ?? user?.email ?? "Desconhecido",
      },
      {
        onSuccess: () => {
          setAddImageUrl("");
          setAddNotes("");
          setShowAddForm(false);
          toast.success("Revisao adicionada");
        },
        onError: () => toast.error("Erro ao adicionar revisao"),
      },
    );
  }

  function handleReview() {
    if (!reviewDialog) return;
    updateStatus.mutate(
      {
        id: reviewDialog.revision.id,
        status: reviewDialog.status,
        feedback: reviewFeedback.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(reviewDialog.status === "approved" ? "Revisao aprovada!" : "Revisao solicitada");
          setReviewDialog(null);
          setReviewFeedback("");
        },
        onError: () => toast.error("Erro ao registrar decisao"),
      },
    );
  }

  function toggleCompare(revisionId: string) {
    if (compareA === revisionId) setCompareA(null);
    else if (compareB === revisionId) setCompareB(null);
    else if (!compareA) setCompareA(revisionId);
    else setCompareB(revisionId);
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconHistory className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              Historico de Revisoes{" "}
              <span className="text-muted-foreground font-normal">({revisions.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {revisions.length >= 2 && (
              <Button
                variant={compareMode ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => { setCompareMode((v) => !v); setCompareA(null); setCompareB(null); }}
              >
                <IconGitCompare className="size-3.5" />
                {compareMode ? "Sair da comparacao" : "Comparar"}
              </Button>
            )}
            {canManage && !compareMode && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAddForm(true)}>
                <IconUpload className="size-3.5" />
                Nova revisao
              </Button>
            )}
          </div>
        </div>

        {/* Compare panel */}
        {compareMode && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="mb-3 text-xs text-muted-foreground">
              Selecione duas revisoes abaixo. Selecionadas:{" "}
              {compareA && compareB ? "2" : compareA || compareB ? "1" : "0"}/2
            </p>
            {compareA && compareB ? (
              <div className="grid grid-cols-2 gap-4">
                {[revisionA, revisionB].map((rev, idx) => {
                  if (!rev) return null;
                  return (
                    <div key={rev.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {idx === 0
                          ? <IconArrowLeft className="size-3.5 text-blue-500" />
                          : <IconArrowRight className="size-3.5 text-purple-500" />}
                        <span className="text-xs font-medium">Rev. #{rev.revision_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rev.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
                      {rev.image_url ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted">
                          <Image src={rev.image_url} alt={`Revisao ${rev.revision_number}`} fill className="object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center rounded-lg border border-border/60 bg-muted">
                          <IconPhoto className="size-8 text-muted-foreground/40" />
                        </div>
                      )}
                      {rev.notes && <p className="text-xs text-muted-foreground">{rev.notes}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Clique em &quot;Selecionar&quot; em duas revisoes abaixo.
              </p>
            )}
          </div>
        )}

        {/* Revisions list */}
        {revisions.length === 0 ? (
          <EmptyState
            title="Sem revisoes"
            description="Registre revisoes de arte para este stage do pipeline."
            compact
          />
        ) : (
          <div className="space-y-2">
            {revisions.map((revision) => (
              <D3DRevisionCard
                key={revision.id}
                revision={revision}
                compareMode={compareMode}
                isSelectedForCompare={compareA === revision.id || compareB === revision.id}
                canManage={canManage}
                onImageClick={setLightbox}
                onSelectCompare={toggleCompare}
                onApprove={(r) => setReviewDialog({ revision: r, status: "approved" })}
                onRequestChanges={(r) => setReviewDialog({ revision: r, status: "changes_requested" })}
              />
            ))}
          </div>
        )}

        {/* Add revision form */}
        {showAddForm && canManage && (
          <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
            <p className="text-sm font-medium">Nova revisao</p>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">URL da imagem</label>
              <Input placeholder="https://..." value={addImageUrl} onChange={(e) => setAddImageUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Notas (opcional)</label>
              <Textarea placeholder="Descricao das alteracoes..." value={addNotes} onChange={(e) => setAddNotes(e.target.value)} rows={2} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddRevision} disabled={createRevision.isPending}>Adicionar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>

      <D3DRevisionReviewDialog
        open={!!reviewDialog}
        onOpenChange={(open) => { if (!open) { setReviewDialog(null); setReviewFeedback(""); } }}
        revisionNumber={reviewDialog?.revision.revision_number ?? null}
        status={reviewDialog?.status ?? "approved"}
        feedback={reviewFeedback}
        onFeedbackChange={setReviewFeedback}
        onConfirm={handleReview}
        isPending={updateStatus.isPending}
      />

      {lightbox && (
        <Dialog open onOpenChange={() => setLightbox(null)}>
          <DialogContent className="max-w-4xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image src={lightbox} alt="Revisao" fill className="object-contain" unoptimized />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
