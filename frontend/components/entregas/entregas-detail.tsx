"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DELIVERABLE_STATUS, DELIVERABLE_TYPES } from "@/lib/constants";
import { useUpdateDeliverable, useDeleteDeliverable } from "@/hooks/use-entregas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

interface EntregasDetailProps {
  deliverable: DeliverableRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntregasDetail({
  deliverable,
  open,
  onOpenChange,
}: EntregasDetailProps) {
  const updateDeliverable = useUpdateDeliverable();
  const deleteDeliverable = useDeleteDeliverable();

  if (!deliverable) return null;

  const handleStatusChange = (status: string) => {
    updateDeliverable.mutate({ id: deliverable.id, updates: { status } });
  };

  const handleTypeChange = (type: string) => {
    updateDeliverable.mutate({ id: deliverable.id, updates: { type } });
  };

  const handleDelete = () => {
    deleteDeliverable.mutate(deliverable.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  // Parse versions if it's a JSON array
  const versions: unknown[] = Array.isArray(deliverable.versions)
    ? (deliverable.versions as unknown[])
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{deliverable.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes da entrega
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {/* Status */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DELIVERABLE_STATUS).map(([key, cfg]) => {
                const isActive = deliverable.status === key;
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer transition-opacity"
                    style={{
                      backgroundColor: isActive ? cfg.bg : undefined,
                      color: isActive ? cfg.color : undefined,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    onClick={() => handleStatusChange(key)}
                  >
                    {cfg.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Type */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DELIVERABLE_TYPES).map(([key, cfg]) => {
                const isActive = deliverable.type === key;
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer transition-opacity"
                    style={{
                      color: isActive ? cfg.color : undefined,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    onClick={() => handleTypeChange(key)}
                  >
                    {cfg.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Projeto
              </p>
              <span>{deliverable.project_name ?? "\u2014"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Versao
              </p>
              <span>{deliverable.current_version ?? "\u2014"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Responsavel
              </p>
              <span>{deliverable.owner_name ?? "\u2014"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Revisor
              </p>
              <span>{deliverable.reviewer_id ?? "\u2014"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Criado em
              </p>
              <span>
                {deliverable.created_at
                  ? format(new Date(deliverable.created_at), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "\u2014"}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Atualizado
              </p>
              <span>
                {deliverable.updated_at
                  ? format(new Date(deliverable.updated_at), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "\u2014"}
              </span>
            </div>
          </div>

          {/* Versions */}
          {versions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Versoes
                </p>
                <ul className="space-y-1 text-sm">
                  {versions.map((v, i) => (
                    <li
                      key={i}
                      className="rounded-md border px-3 py-2 text-muted-foreground"
                    >
                      {typeof v === "string" ? v : JSON.stringify(v)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          {/* Footer */}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteDeliverable.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteDeliverable.isPending ? "Excluindo..." : "Excluir Entrega"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
