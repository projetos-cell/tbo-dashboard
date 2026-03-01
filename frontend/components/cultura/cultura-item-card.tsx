"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Columns3,
  Repeat,
  Shield,
  Award,
  Heart,
  FileText,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CULTURA_CATEGORIES, CULTURA_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pilar: Columns3,
  ritual: Repeat,
  politica: Shield,
  reconhecimento: Award,
  valor: Heart,
  documento: FileText,
  manual: BookOpen,
};

interface CulturaItemCardProps {
  item: CulturaRow;
  onView?: (item: CulturaRow) => void;
  onEdit?: (item: CulturaRow) => void;
  onDelete?: (item: CulturaRow) => void;
  canEdit?: boolean;
}

export function CulturaItemCard({
  item,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
}: CulturaItemCardProps) {
  const catDef =
    CULTURA_CATEGORIES[item.category as keyof typeof CULTURA_CATEGORIES];
  const statusDef =
    CULTURA_STATUS[item.status as keyof typeof CULTURA_STATUS];
  const Icon = CATEGORY_ICONS[item.category] || FileText;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="rounded-lg p-2 shrink-0"
            style={{ backgroundColor: catDef?.bg || "rgba(107,114,128,0.12)" }}
          >
            <Icon
              className="size-5"
              style={{ color: catDef?.color || "#6b7280" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="text-sm font-medium truncate cursor-pointer hover:text-primary"
                onClick={() => onView?.(item)}
              >
                {item.title}
              </h3>
              {statusDef && item.status !== "published" && (
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0"
                  style={{ color: statusDef.color }}
                >
                  {statusDef.label}
                </Badge>
              )}
            </div>

            {item.content_html && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {stripHtml(item.content_html).slice(0, 120)}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {item.updated_at && (
                <span>
                  {format(new Date(item.updated_at), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </span>
              )}
              {item.version > 1 && <span>v{item.version}</span>}
            </div>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Acoes"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(item)}>
                  <Eye className="size-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                  <Pencil className="size-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(item)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
