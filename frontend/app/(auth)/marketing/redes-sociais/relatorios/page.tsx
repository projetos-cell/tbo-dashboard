"use client";

import {
  IconFileText,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";

function RelatoriosContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatorios de Redes Sociais</h1>
          <p className="text-sm text-muted-foreground">Relatorios comparativos e exportacao de dados.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Gerar Relatorio
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:border-amber-400/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-amber-500/10">
                <IconFileText className="size-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Relatorio Mensal</p>
                <p className="text-xs text-muted-foreground">Performance consolidada do mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-400/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-blue-500/10">
                <IconFileText className="size-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Relatorio Trimestral</p>
                <p className="text-xs text-muted-foreground">Comparativo trimestral</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-purple-400/40 transition-colors">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-purple-500/10">
                <IconDownload className="size-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Exportar Dados</p>
                <p className="text-xs text-muted-foreground">CSV ou PDF com metricas completas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EmptyState
        icon={IconFileText}
        title="Relatorios em construcao"
        description="A geracao automatica de relatorios sera disponibilizada em breve."
      />
    </div>
  );
}

export default function RelatoriosRedesSociaisPage() {
  return (
    <RequireRole module="marketing">
      <RelatoriosContent />
    </RequireRole>
  );
}
