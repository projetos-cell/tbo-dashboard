"use client";

import { useState, useRef, useCallback } from "react";
import {
  IconX,
  IconCheck,
  IconTrash,
  IconMessageCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  useFileAnnotations,
  useCreateFileAnnotation,
  useToggleAnnotationResolved,
  useDeleteFileAnnotation,
} from "@/features/projects/hooks/use-file-annotations";
import { useAuthStore } from "@/stores/auth-store";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FileProofingViewerProps {
  fileId: string;
  fileName: string;
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileProofingViewer({
  fileId,
  fileName,
  imageUrl,
  open,
  onOpenChange,
}: FileProofingViewerProps) {
  const { data: annotations = [] } = useFileAnnotations(open ? fileId : undefined);
  const createAnnotation = useCreateFileAnnotation(fileId);
  const toggleResolved = useToggleAnnotationResolved(fileId);
  const deleteAnnotation = useDeleteFileAnnotation(fileId);
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userName = useAuthStore((s) => s.user?.user_metadata?.full_name as string | undefined) ?? "Usuário";

  const imageRef = useRef<HTMLDivElement>(null);
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      setNewPin({ x: Math.round(xPct * 100) / 100, y: Math.round(yPct * 100) / 100 });
      setSelectedPinId(null);
      setNewComment("");
    },
    []
  );

  const handleCreateAnnotation = useCallback(() => {
    if (!newPin || !newComment.trim() || !tenantId || !userId) return;
    createAnnotation.mutate(
      {
        file_id: fileId,
        tenant_id: tenantId,
        author_id: userId,
        author_name: userName,
        x_pct: newPin.x,
        y_pct: newPin.y,
        content: newComment.trim(),
      } as never,
      {
        onSuccess: () => {
          setNewPin(null);
          setNewComment("");
        },
      }
    );
  }, [newPin, newComment, tenantId, userId, userName, fileId, createAnnotation]);

  const visibleAnnotations = showResolved
    ? annotations
    : annotations.filter((a) => !a.resolved);

  const unresolvedCount = annotations.filter((a) => !a.resolved).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium truncate max-w-[300px]">{fileName}</h3>
            <Badge variant="outline" className="text-xs gap-1">
              <IconMessageCircle className="size-3" />
              {unresolvedCount} {unresolvedCount === 1 ? "comentário" : "comentários"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-border"
              />
              Mostrar resolvidos
            </label>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(90vh - 44px)" }}>
          {/* Image area */}
          <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
            <div
              ref={imageRef}
              className="relative cursor-crosshair select-none"
              onClick={handleImageClick}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={fileName}
                className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded"
                draggable={false}
              />

              {/* Existing pins */}
              {visibleAnnotations.map((ann, i) => (
                <button
                  key={ann.id}
                  type="button"
                  className={cn(
                    "absolute flex items-center justify-center size-6 -translate-x-1/2 -translate-y-1/2 rounded-full text-[10px] font-bold shadow-lg border-2 transition-transform hover:scale-125",
                    ann.resolved
                      ? "bg-green-500 border-green-600 text-white"
                      : selectedPinId === ann.id
                        ? "bg-orange-500 border-orange-600 text-white scale-125"
                        : "bg-orange-500 border-orange-600 text-white"
                  )}
                  style={{ left: `${ann.x_pct}%`, top: `${ann.y_pct}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinId(selectedPinId === ann.id ? null : ann.id);
                    setNewPin(null);
                  }}
                  title={ann.content}
                >
                  {ann.resolved ? <IconCheck className="size-3" /> : i + 1}
                </button>
              ))}

              {/* New pin preview */}
              {newPin && (
                <div
                  className="absolute flex items-center justify-center size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 border-2 border-blue-600 text-white text-[10px] font-bold shadow-lg animate-pulse"
                  style={{ left: `${newPin.x}%`, top: `${newPin.y}%` }}
                >
                  +
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: pin details / new comment */}
          <div className="w-72 border-l bg-background flex flex-col overflow-hidden shrink-0">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* New pin form */}
              {newPin && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-2">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Novo comentário
                  </p>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Descreva a alteração necessária..."
                    rows={3}
                    className="text-xs resize-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleCreateAnnotation();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="h-7 text-xs flex-1"
                      disabled={!newComment.trim() || createAnnotation.isPending}
                      onClick={handleCreateAnnotation}
                    >
                      Comentar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        setNewPin(null);
                        setNewComment("");
                      }}
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected pin detail */}
              {selectedPinId && (() => {
                const ann = annotations.find((a) => a.id === selectedPinId);
                if (!ann) return null;
                return (
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{ann.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm">{ann.content}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant={ann.resolved ? "secondary" : "outline"}
                        className="h-6 text-[10px] gap-1"
                        onClick={() =>
                          toggleResolved.mutate({ id: ann.id, resolved: !ann.resolved })
                        }
                      >
                        <IconCircleCheck className="size-3" />
                        {ann.resolved ? "Reabrir" : "Resolver"}
                      </Button>
                      <ConfirmDialog
                        title="Excluir anotação?"
                        description="Esta anotação será removida permanentemente."
                        confirmLabel="Excluir"
                        onConfirm={() => {
                          deleteAnnotation.mutate(ann.id);
                          setSelectedPinId(null);
                        }}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[10px] text-red-500 hover:text-red-600"
                          >
                            <IconTrash className="size-3" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                );
              })()}

              {/* All annotations list */}
              {!newPin && !selectedPinId && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Clique na imagem para adicionar um comentário
                  </p>
                  {visibleAnnotations.map((ann, i) => (
                    <button
                      key={ann.id}
                      type="button"
                      className={cn(
                        "w-full text-left rounded-md border p-2.5 space-y-1 transition-colors hover:bg-muted/50",
                        ann.resolved && "opacity-60"
                      )}
                      onClick={() => setSelectedPinId(ann.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex items-center justify-center size-5 rounded-full text-[9px] font-bold text-white shrink-0",
                            ann.resolved ? "bg-green-500" : "bg-orange-500"
                          )}
                        >
                          {ann.resolved ? <IconCheck className="size-2.5" /> : i + 1}
                        </span>
                        <span className="text-xs font-medium truncate">{ann.author_name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                          {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-7">
                        {ann.content}
                      </p>
                    </button>
                  ))}
                  {visibleAnnotations.length === 0 && !newPin && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Nenhum comentário neste arquivo
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
