"use client";

import { Repeat, Clock, Calendar, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FREQUENCY_LABELS } from "@/features/cultura/services/ritual-types";
import type { Database } from "@/lib/supabase/types";

type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

interface RitualCardProps {
  ritual: RitualTypeRow;
  canEdit: boolean;
  onEdit: (ritual: RitualTypeRow) => void;
  onDelete: (ritual: RitualTypeRow) => void;
  onToggleActive: (ritual: RitualTypeRow) => void;
}

export function RitualCard({ ritual, canEdit, onEdit, onDelete, onToggleActive }: RitualCardProps) {
  return (
    <Card className={`relative overflow-hidden ${!ritual.is_active ? "opacity-60" : ""}`}>
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: ritual.color ?? "#3b82f6" }}
      />
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Repeat className="size-4 shrink-0" style={{ color: ritual.color ?? "#3b82f6" }} />
              <h3 className="font-medium text-sm truncate">{ritual.name}</h3>
              {ritual.is_system && (
                <Badge variant="secondary" className="text-xs shrink-0">Sistema</Badge>
              )}
            </div>

            {ritual.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{ritual.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                <Calendar className="size-3 mr-0.5" />
                {FREQUENCY_LABELS[ritual.frequency ?? ""] ?? ritual.frequency}
              </Badge>
              {ritual.duration_minutes && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="size-3 mr-0.5" />
                  {ritual.duration_minutes}min
                </Badge>
              )}
              {!ritual.is_active && (
                <Badge variant="destructive" className="text-xs">Inativo</Badge>
              )}
            </div>

            {ritual.default_agenda && (
              <p className="text-xs text-gray-500 line-clamp-2 border-l-2 pl-2 mt-1">
                {ritual.default_agenda}
              </p>
            )}
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(ritual)}>
                  <Edit className="size-3.5 mr-1.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(ritual)}>
                  {ritual.is_active ? (
                    <><ToggleLeft className="size-3.5 mr-1.5" />Desativar</>
                  ) : (
                    <><ToggleRight className="size-3.5 mr-1.5" />Ativar</>
                  )}
                </DropdownMenuItem>
                {!ritual.is_system && (
                  <DropdownMenuItem className="text-red-500" onClick={() => onDelete(ritual)}>
                    <Trash2 className="size-3.5 mr-1.5" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
