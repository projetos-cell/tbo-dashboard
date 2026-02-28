"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  ExternalLink,
  Link2,
  Mic,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MEETING_STATUS, MEETING_CATEGORIES } from "@/lib/constants";
import { useUpdateMeeting, useDeleteMeeting } from "@/hooks/use-meetings";
import type { Database } from "@/lib/supabase/types";

type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];

interface MeetingDetailProps {
  meeting: MeetingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeetingDetail({
  meeting,
  open,
  onOpenChange,
}: MeetingDetailProps) {
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!meeting) return null;

  const statusCfg =
    MEETING_STATUS[meeting.status as keyof typeof MEETING_STATUS];
  const categoryCfg = meeting.category
    ? MEETING_CATEGORIES[meeting.category]
    : null;

  // --- Handlers ---

  const handleUpdate = (
    updates: Database["public"]["Tables"]["meetings"]["Update"]
  ) => {
    updateMeeting.mutate({ id: meeting.id, updates });
  };

  const handleStatusChange = (status: string) => {
    handleUpdate({ status });
  };

  const handleCategoryChange = (category: string) => {
    handleUpdate({ category });
  };

  const handleDelete = () => {
    deleteMeeting.mutate(meeting.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  // Parse action_items (JSON field - could be array, object, or string)
  const actionItems: string[] = (() => {
    if (!meeting.action_items) return [];
    const raw = meeting.action_items;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return [raw];
      }
    }
    return [];
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <SheetTitle className="flex-1 text-lg font-semibold leading-snug">
              {meeting.title}
            </SheetTitle>
            {meeting.meeting_link && (
              <a
                href={meeting.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                  <Video className="h-3.5 w-3.5" />
                  Abrir reuniao
                </Button>
              </a>
            )}
          </div>
          <SheetDescription className="sr-only">
            Detalhes da reuniao
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Status */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(MEETING_STATUS).map(([key, cfg]) => (
                <Badge
                  key={key}
                  variant={meeting.status === key ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  style={
                    meeting.status === key
                      ? { backgroundColor: cfg.color, color: "#fff" }
                      : undefined
                  }
                  onClick={() => handleStatusChange(key)}
                >
                  {cfg.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Categoria
            </p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(MEETING_CATEGORIES).map(([key, cfg]) => (
                <Badge
                  key={key}
                  variant={meeting.category === key ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  style={
                    meeting.category === key
                      ? { backgroundColor: cfg.color, color: "#fff" }
                      : undefined
                  }
                  onClick={() => handleCategoryChange(key)}
                >
                  {cfg.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date / Time / Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Data
              </p>
              <p className="text-sm">
                {meeting.date
                  ? format(new Date(meeting.date + "T12:00:00"), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "\u2014"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" /> Horario
              </p>
              <p className="text-sm">
                {meeting.time ? meeting.time.slice(0, 5) : "\u2014"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" /> Duracao
              </p>
              <p className="text-sm">
                {meeting.duration_minutes
                  ? `${meeting.duration_minutes} min`
                  : "\u2014"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Participants */}
          {meeting.participants && meeting.participants.length > 0 && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3 w-3" /> Participantes
              </p>
              <div className="flex flex-wrap gap-1">
                {meeting.participants.map((p) => (
                  <Badge key={p} variant="secondary" className="text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {meeting.summary && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Resumo
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {meeting.summary}
              </p>
            </div>
          )}

          {/* Overview (short_summary or overview) */}
          {meeting.overview && !meeting.summary && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Visao Geral
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {meeting.overview}
              </p>
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Notas
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {meeting.notes}
                </p>
              </div>
            </>
          )}

          {/* Action Items */}
          {actionItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Itens de Acao
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  {actionItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Keywords */}
          {meeting.keywords && meeting.keywords.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Palavras-chave
                </p>
                <div className="flex flex-wrap gap-1">
                  {meeting.keywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="text-[10px]">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* External Links */}
          {(meeting.meeting_link ||
            meeting.fireflies_url ||
            meeting.audio_url) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Links
                </p>
                <div className="flex flex-wrap gap-2">
                  {meeting.meeting_link && (
                    <a
                      href={meeting.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Link da Reuniao
                      </Button>
                    </a>
                  )}
                  {meeting.fireflies_url && (
                    <a
                      href={meeting.fireflies_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Fireflies
                      </Button>
                    </a>
                  )}
                  {meeting.audio_url && (
                    <a
                      href={meeting.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        Audio
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Footer: timestamps + delete */}
          <div className="flex items-end justify-between">
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              {meeting.created_at && (
                <p>
                  Criada{" "}
                  {format(new Date(meeting.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
              {meeting.updated_at && (
                <p>
                  Atualizada{" "}
                  {format(new Date(meeting.updated_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </div>

            <div>
              {confirmDelete ? (
                <div className="space-y-1.5 text-right">
                  <p className="text-xs text-red-600">Excluir reuniao?</p>
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-xs"
                      onClick={handleDelete}
                      disabled={deleteMeeting.isPending}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
