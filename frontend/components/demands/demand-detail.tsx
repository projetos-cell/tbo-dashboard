"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  ExternalLink,
  Flag,
  Tag,
  User,
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
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-left leading-tight pr-6">
            {demand.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da demanda
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Status */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            {statusCfg ? (
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: statusCfg.bg,
                  color: statusCfg.color,
                }}
              >
                {statusCfg.label}
              </Badge>
            ) : (
              <Badge variant="secondary">{demand.status}</Badge>
            )}
          </div>

          {/* Priority */}
          {demand.prioridade && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Flag className="h-3 w-3" /> Prioridade
              </p>
              {priCfg ? (
                <span
                  className="text-sm font-medium"
                  style={{ color: priCfg.color }}
                >
                  {priCfg.label}
                </span>
              ) : (
                <span className="text-sm">{demand.prioridade}</span>
              )}
            </div>
          )}

          {/* Responsible */}
          {demand.responsible && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <User className="h-3 w-3" /> Responsavel
              </p>
              <span className="text-sm">{demand.responsible}</span>
            </div>
          )}

          {/* BU */}
          {demand.bus && demand.bus.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Unidades de Negocio
              </p>
              <div className="flex flex-wrap gap-1">
                {demand.bus.map((bu) => {
                  const buColor = BU_COLORS[bu];
                  return (
                    <Badge
                      key={bu}
                      variant="secondary"
                      style={
                        buColor
                          ? {
                              backgroundColor: buColor.bg,
                              color: buColor.color,
                            }
                          : undefined
                      }
                    >
                      {bu}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Inicio
              </p>
              <span className="text-sm">
                {demand.start_date
                  ? format(
                      new Date(demand.start_date + "T12:00:00"),
                      "dd MMM yyyy",
                      { locale: ptBR }
                    )
                  : "—"}
              </span>
            </div>
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Prazo
              </p>
              <span
                className={`text-sm ${overdue ? "font-medium text-red-600" : ""}`}
              >
                {demand.due_date
                  ? format(
                      new Date(demand.due_date + "T12:00:00"),
                      "dd MMM yyyy",
                      { locale: ptBR }
                    )
                  : "—"}
              </span>
            </div>
          </div>

          {demand.due_date_end && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" /> Fim previsto
              </p>
              <span className="text-sm">
                {format(
                  new Date(demand.due_date_end + "T12:00:00"),
                  "dd MMM yyyy",
                  { locale: ptBR }
                )}
              </span>
            </div>
          )}

          <Separator />

          {/* Tags */}
          {demand.tags && demand.tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1">
                {demand.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de midia */}
          {demand.tipo_midia && demand.tipo_midia.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Tipo de Midia
              </p>
              <div className="flex flex-wrap gap-1">
                {demand.tipo_midia.map((tipo) => (
                  <Badge key={tipo} variant="outline" className="text-xs">
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Info / Description */}
          {demand.info && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Informacoes
              </p>
              <p className="text-sm whitespace-pre-wrap">{demand.info}</p>
            </div>
          )}

          {/* Formalizacao */}
          {demand.formalizacao && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Formalizacao
              </p>
              <span className="text-sm">{demand.formalizacao}</span>
            </div>
          )}

          {/* Subitem / Item principal */}
          {demand.item_principal && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Item Principal
              </p>
              <span className="text-sm">{demand.item_principal}</span>
            </div>
          )}

          {demand.subitem && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Subitem
              </p>
              <span className="text-sm">{demand.subitem}</span>
            </div>
          )}

          {/* Milestones */}
          {demand.milestones && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Milestones
              </p>
              <span className="text-sm">{demand.milestones}</span>
            </div>
          )}

          <Separator />

          {/* Notion link */}
          {demand.notion_url && (
            <a
              href={demand.notion_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
