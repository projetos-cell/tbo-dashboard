"use client";

import {
  IconCalendarEvent,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentItems } from "@/features/marketing/hooks/use-marketing-content";
import { MARKETING_CONTENT_STATUS } from "@/lib/constants";
import type { ContentStatus } from "@/features/marketing/types/marketing";

function CalendarioContent() {
  const { data: items, isLoading, error, refetch } = useContentItems();

  const scheduled = (items ?? []).filter((i) => i.scheduled_date).sort(
    (a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario Editorial</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e planeje publicacoes no calendario.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Conteudo
        </Button>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar calendario." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : scheduled.length === 0 ? (
        <EmptyState
          icon={IconCalendarEvent}
          title="Nenhum conteudo agendado"
          description="Agende conteudos para ve-los no calendario editorial."
        />
      ) : (
        <div className="space-y-3">
          {scheduled.map((item) => {
            const statusDef = MARKETING_CONTENT_STATUS[item.status as ContentStatus];
            return (
              <Card key={item.id} className="cursor-pointer hover:border-purple-400/40 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-2xl font-bold">
                      {new Date(item.scheduled_date!).getDate()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.scheduled_date!).toLocaleDateString("pt-BR", { month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.channel && <Badge variant="outline" className="text-xs">{item.channel}</Badge>}
                      {statusDef && (
                        <Badge variant="secondary" style={{ backgroundColor: statusDef.bg, color: statusDef.color }} className="text-xs">
                          {statusDef.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.author_name && (
                    <p className="text-xs text-muted-foreground hidden md:block">{item.author_name}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <RequireRole module="marketing">
      <CalendarioContent />
    </RequireRole>
  );
}
