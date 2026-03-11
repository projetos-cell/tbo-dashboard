"use client";

import { useState } from "react";
import {
  ExternalLink,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEditable } from "@/components/ui/inline-editable";
import { DemandCommentThread } from "@/features/demands/components/demand-comment-thread";
import { DemandDetailSidebar } from "@/features/demands/components/demand-detail-sidebar";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { DEMAND_STATUS } from "@/lib/constants";
import { useUpdateDemand, useDeleteDemand } from "@/features/demands/hooks/use-demands";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

interface DemandDetailProps {
  demand: DemandRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemandDetail({
  demand,
  open,
  onOpenChange,
}: DemandDetailProps) {
  const updateDemand = useUpdateDemand();
  const deleteDemand = useDeleteDemand();
  const [bottomTab, setBottomTab] = useState<"comments" | "activity">("comments");

  if (!demand) return null;

  const isDone = demand.feito || demand.status === "Concluído" || demand.status === "Concluido";

  const handleUpdate = (updates: Database["public"]["Tables"]["demands"]["Update"]) => {
    updateDemand.mutate({ id: demand.id, updates });
  };

  const handleDelete = () => {
    deleteDemand.mutate(demand.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <SheetTitle className="flex-1">
              <InlineEditable
                value={demand.title}
                onSave={(title) => handleUpdate({ title })}
                variant="h2"
              />
            </SheetTitle>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="Acoes">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                  {demand.notion_url && (
                    <DropdownMenuItem onClick={() => window.open(demand.notion_url!, "_blank")}>
                      <ExternalLink className="size-3.5 mr-2" />
                      Abrir no Notion
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleUpdate({ feito: !demand.feito })}>
                    {isDone ? "Marcar como pendente" : "Marcar como feito"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  {Object.entries(DEMAND_STATUS)
                    .filter(([key]) => key !== "Concluido")
                    .map(([key, cfg]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => {
                          const feito = key === "Concluído" || key === "Concluido";
                          handleUpdate({ status: key, feito });
                        }}
                      >
                        <span
                          className="size-2 rounded-full mr-2 shrink-0"
                          style={{ backgroundColor: cfg.color }}
                        />
                        {cfg.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SheetDescription className="sr-only">Detalhes da demanda</SheetDescription>
        </SheetHeader>

        <div className="flex gap-0 min-h-[60vh]">
          {/* Left column — content */}
          <div className="flex-1 px-6 py-4 space-y-5 border-r min-w-0">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Informacoes</p>
              <textarea
                className="w-full min-h-[100px] text-sm bg-transparent border rounded-md p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={demand.info || ""}
                placeholder="Adicionar informacoes..."
                onBlur={(e) => {
                  const info = e.target.value;
                  if (info !== (demand.info || "")) handleUpdate({ info });
                }}
              />
            </div>

            <Separator />

            <div>
              <div className="flex gap-1 mb-3">
                <Button
                  size="sm"
                  variant={bottomTab === "comments" ? "secondary" : "ghost"}
                  className="h-7 text-xs"
                  onClick={() => setBottomTab("comments")}
                >
                  <MessageSquare className="size-3 mr-1" />
                  Comentarios
                </Button>
                <Button
                  size="sm"
                  variant={bottomTab === "activity" ? "secondary" : "ghost"}
                  className="h-7 text-xs"
                  onClick={() => setBottomTab("activity")}
                >
                  <History className="size-3 mr-1" />
                  Atividade
                </Button>
              </div>

              {bottomTab === "comments" ? (
                <DemandCommentThread demandId={demand.id} />
              ) : (
                <ActivityFeed activities={[]} isLoading={false} emptyMessage="Nenhuma atividade" />
              )}
            </div>
          </div>

          {/* Right sidebar — properties */}
          <DemandDetailSidebar
            demand={demand}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isDeleting={deleteDemand.isPending}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
