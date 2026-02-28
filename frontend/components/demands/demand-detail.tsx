"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  ExternalLink,
  Flag,
  MoreHorizontal,
  Trash2,
  Tag,
  User,
  X,
  Plus,
  MessageSquare,
  History,
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
import { DemandCommentThread } from "@/components/demands/demand-comment-thread";
import { ActivityFeed } from "@/components/shared/activity-feed";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  BU_COLORS,
} from "@/lib/constants";
import { useUpdateDemand, useDeleteDemand } from "@/hooks/use-demands";
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

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bottomTab, setBottomTab] = useState<"comments" | "activity">(
    "comments"
  );
  const [newTag, setNewTag] = useState("");
  const [newTipoMidia, setNewTipoMidia] = useState("");

  if (!demand) return null;

  const statusCfg = DEMAND_STATUS[demand.status];
  const priCfg = demand.prioridade
    ? DEMAND_PRIORITY[demand.prioridade.toLowerCase()]
    : null;
  const isDone =
    demand.feito ||
    demand.status === "Concluído" ||
    demand.status === "Concluido";
  const overdue =
    demand.due_date &&
    !isDone &&
    demand.due_date < new Date().toISOString().split("T")[0];

  // --- Handlers ---

  const handleUpdate = (updates: Database["public"]["Tables"]["demands"]["Update"]) => {
    updateDemand.mutate({ id: demand.id, updates });
  };

  const handleStatusChange = (status: string) => {
    const feito = status === "Concluído" || status === "Concluido";
    handleUpdate({ status, feito });
  };

  const handlePriorityChange = (prioridade: string) => {
    handleUpdate({ prioridade });
  };

  const handleTitleSave = (title: string) => {
    handleUpdate({ title });
  };

  const handleInfoBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const info = e.target.value;
    if (info !== (demand.info || "")) {
      handleUpdate({ info });
    }
  };

  const handleDateChange = (
    field: "start_date" | "due_date" | "due_date_end",
    value: string
  ) => {
    handleUpdate({ [field]: value || null });
  };

  const handleResponsibleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const responsible = e.target.value;
    if (responsible !== (demand.responsible || "")) {
      handleUpdate({ responsible: responsible || null });
    }
  };

  const handleBuToggle = (bu: string) => {
    const current = demand.bus || [];
    const next = current.includes(bu)
      ? current.filter((b) => b !== bu)
      : [...current, bu];
    handleUpdate({ bus: next });
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = demand.tags || [];
    if (current.includes(trimmed)) return;
    handleUpdate({ tags: [...current, trimmed] });
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    const current = demand.tags || [];
    handleUpdate({ tags: current.filter((t) => t !== tag) });
  };

  const handleAddTipoMidia = (tipo: string) => {
    const trimmed = tipo.trim();
    if (!trimmed) return;
    const current = demand.tipo_midia || [];
    if (current.includes(trimmed)) return;
    handleUpdate({ tipo_midia: [...current, trimmed] });
    setNewTipoMidia("");
  };

  const handleRemoveTipoMidia = (tipo: string) => {
    const current = demand.tipo_midia || [];
    handleUpdate({ tipo_midia: current.filter((t) => t !== tipo) });
  };

  const handleInlineFieldSave = (
    field: "formalizacao" | "item_principal" | "subitem" | "milestones",
    value: string
  ) => {
    handleUpdate({ [field]: value || null });
  };

  const handleDelete = () => {
    deleteDemand.mutate(demand.id, {
      onSuccess: () => {
        onOpenChange(false);
        setConfirmDelete(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-3">
            <SheetTitle className="flex-1">
              <InlineEditable
                value={demand.title}
                onSave={handleTitleSave}
                variant="h2"
              />
            </SheetTitle>

            {/* Context menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                  {demand.notion_url && (
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(demand.notion_url!, "_blank")
                      }
                    >
                      <ExternalLink className="size-3.5 mr-2" />
                      Abrir no Notion
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() =>
                      handleUpdate({ feito: !demand.feito })
                    }
                  >
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
                        onClick={() => handleStatusChange(key)}
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
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SheetDescription className="sr-only">
            Detalhes da demanda
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-0 min-h-[60vh]">
          {/* Left column — main content */}
          <div className="flex-1 px-6 py-4 space-y-5 border-r min-w-0">
            {/* Info / Description */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Informacoes
              </p>
              <textarea
                className="w-full min-h-[100px] text-sm bg-transparent border rounded-md p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={demand.info || ""}
                placeholder="Adicionar informacoes..."
                onBlur={handleInfoBlur}
              />
            </div>

            <Separator />

            {/* Comments / Activity tabs */}
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
                <ActivityFeed
                  activities={[]}
                  isLoading={false}
                  emptyMessage="Nenhuma atividade"
                />
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-[220px] shrink-0 px-4 py-4 space-y-4 text-sm">
            {/* Status */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(DEMAND_STATUS)
                  .filter(([key]) => key !== "Concluido")
                  .map(([key, cfg]) => (
                    <Badge
                      key={key}
                      variant={demand.status === key ? "default" : "outline"}
                      className="cursor-pointer text-[10px]"
                      style={
                        demand.status === key
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

            {/* Priority */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Flag className="h-3 w-3" /> Prioridade
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(DEMAND_PRIORITY).map(([key, cfg]) => {
                  const isActive =
                    demand.prioridade?.toLowerCase() === key;
                  return (
                    <Badge
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      className="cursor-pointer text-[10px]"
                      style={
                        isActive
                          ? { backgroundColor: cfg.color, color: "#fff" }
                          : undefined
                      }
                      onClick={() => handlePriorityChange(key)}
                    >
                      {cfg.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Responsible */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <User className="h-3 w-3" /> Responsavel
              </p>
              <input
                type="text"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                defaultValue={demand.responsible || ""}
                placeholder="Nome do responsavel..."
                onBlur={handleResponsibleBlur}
              />
            </div>

            {/* BUs */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Unidades de Negocio
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(BU_COLORS).map(([bu, buColor]) => {
                  const isActive = (demand.bus || []).includes(bu);
                  return (
                    <Badge
                      key={bu}
                      variant={isActive ? "secondary" : "outline"}
                      className="cursor-pointer text-[10px]"
                      style={
                        isActive
                          ? {
                              backgroundColor: buColor.bg,
                              color: buColor.color,
                            }
                          : undefined
                      }
                      onClick={() => handleBuToggle(bu)}
                    >
                      {bu}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Inicio
              </p>
              <input
                type="date"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent"
                value={demand.start_date || ""}
                onChange={(e) =>
                  handleDateChange("start_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Prazo
              </p>
              <input
                type="date"
                className={`w-full text-xs border rounded px-2 py-1 bg-transparent ${
                  overdue ? "text-red-600 border-red-300" : ""
                }`}
                value={demand.due_date || ""}
                onChange={(e) =>
                  handleDateChange("due_date", e.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Fim previsto
              </p>
              <input
                type="date"
                className="w-full text-xs border rounded px-2 py-1 bg-transparent"
                value={demand.due_date_end || ""}
                onChange={(e) =>
                  handleDateChange("due_date_end", e.target.value)
                }
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {(demand.tags || []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] gap-0.5 pr-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="w-16 text-[10px] border rounded px-1 py-0.5 bg-transparent"
                    placeholder="+ tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                  />
                  {newTag.trim() && (
                    <button onClick={() => handleAddTag(newTag)}>
                      <Plus className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tipo de Midia */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Tipo de Midia
              </p>
              <div className="flex flex-wrap gap-1">
                {(demand.tipo_midia || []).map((tipo) => (
                  <Badge
                    key={tipo}
                    variant="outline"
                    className="text-[10px] gap-0.5 pr-1"
                  >
                    {tipo}
                    <button
                      onClick={() => handleRemoveTipoMidia(tipo)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="w-16 text-[10px] border rounded px-1 py-0.5 bg-transparent"
                    placeholder="+ tipo"
                    value={newTipoMidia}
                    onChange={(e) => setNewTipoMidia(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTipoMidia(newTipoMidia);
                      }
                    }}
                  />
                  {newTipoMidia.trim() && (
                    <button onClick={() => handleAddTipoMidia(newTipoMidia)}>
                      <Plus className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Inline text fields */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Formalizacao
              </p>
              <InlineEditable
                value={demand.formalizacao || ""}
                onSave={(v) => handleInlineFieldSave("formalizacao", v)}
                variant="small"
                placeholder="—"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Item Principal
              </p>
              <InlineEditable
                value={demand.item_principal || ""}
                onSave={(v) => handleInlineFieldSave("item_principal", v)}
                variant="small"
                placeholder="—"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Subitem
              </p>
              <InlineEditable
                value={demand.subitem || ""}
                onSave={(v) => handleInlineFieldSave("subitem", v)}
                variant="small"
                placeholder="—"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Milestones
              </p>
              <InlineEditable
                value={demand.milestones || ""}
                onSave={(v) => handleInlineFieldSave("milestones", v)}
                variant="small"
                placeholder="—"
              />
            </div>

            <Separator />

            {/* Notion link */}
            {demand.notion_url && (
              <a
                href={demand.notion_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir no Notion
                </Button>
              </a>
            )}

            {/* Timestamps */}
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              {demand.created_at && (
                <p>
                  Criada{" "}
                  {format(new Date(demand.created_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
              {demand.updated_at && (
                <p>
                  Atualizada{" "}
                  {format(new Date(demand.updated_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </p>
              )}
            </div>

            {/* Delete */}
            <div>
              {confirmDelete ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-red-600">Excluir demanda?</p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-xs"
                      onClick={handleDelete}
                      disabled={deleteDemand.isPending}
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
