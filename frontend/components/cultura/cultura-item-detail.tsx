"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock, Pencil, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCulturaItem, useCulturaVersions } from "@/hooks/use-cultura";
import { CULTURA_CATEGORIES, CULTURA_STATUS } from "@/lib/constants";

interface CulturaItemDetailProps {
  itemId: string;
  onBack: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function CulturaItemDetail({
  itemId,
  onBack,
  onEdit,
  canEdit = false,
}: CulturaItemDetailProps) {
  const { data: item, isLoading } = useCulturaItem(itemId);
  const { data: versions } = useCulturaVersions(itemId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Item nao encontrado.</p>
        <Button variant="link" onClick={onBack} className="mt-2">
          Voltar
        </Button>
      </div>
    );
  }

  const catDef =
    CULTURA_CATEGORIES[item.category as keyof typeof CULTURA_CATEGORIES];
  const statusDef =
    CULTURA_STATUS[item.status as keyof typeof CULTURA_STATUS];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{item.title}</h1>
            {catDef && (
              <Badge
                variant="outline"
                style={{ color: catDef.color, borderColor: catDef.color }}
              >
                {catDef.label}
              </Badge>
            )}
            {statusDef && item.status !== "published" && (
              <Badge variant="outline" style={{ color: statusDef.color }}>
                {statusDef.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {item.updated_at && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                Atualizado em{" "}
                {format(new Date(item.updated_at), "dd MMM yyyy 'as' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            )}
            {item.version > 1 && <span>Versao {item.version}</span>}
          </div>
        </div>
        {canEdit && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-3.5 mr-1" />
            Editar
          </Button>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {item.content_html ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content_html }}
            />
          ) : item.content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhum conteudo adicionado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Version history */}
      {versions && versions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="size-4" />
              Historico de versoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <span className="font-medium">v{v.version}</span>
                    <span className="text-muted-foreground ml-2">
                      {v.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {v.created_at &&
                      format(new Date(v.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
