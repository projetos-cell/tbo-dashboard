"use client";

import {
  IconCheck,
  IconAlertCircle,
  IconCircleCheck,
  IconPlug,
  IconLoader2,
  IconPlugOff,
  IconExternalLink,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NotionStatus } from "@/features/integrations/hooks/use-notion-integration";

interface NotionConnectionCardProps {
  connected: boolean;
  statusLoading: boolean;
  status: NotionStatus | undefined;
  disconnect: { mutate: () => void; isPending: boolean };
  authUrl: string;
}

export function NotionConnectionCard({
  connected,
  statusLoading,
  status,
  disconnect,
  authUrl,
}: NotionConnectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {connected ? (
            <IconCircleCheck className="h-4 w-4 text-green-500" />
          ) : (
            <IconPlug className="h-4 w-4 text-gray-500" />
          )}
          <CardTitle className="text-sm font-medium">
            {connected ? "Conectado ao Notion" : "Conectar com Notion"}
          </CardTitle>
        </div>
        <CardDescription>
          {connected
            ? "O dashboard tem acesso ao workspace do Notion para sincronizar demandas."
            : "Autorize o acesso ao workspace do Notion para habilitar a sincronizacao."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statusLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <IconLoader2 className="h-4 w-4 animate-spin" />
            Verificando conexao...
          </div>
        ) : connected ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              {status?.workspace_name && (
                <Badge variant="secondary">Workspace: {status.workspace_name}</Badge>
              )}
              {status?.owner_name && (
                <Badge variant="outline">Por: {status.owner_name}</Badge>
              )}
              {status?.connected_at && (
                <Badge variant="outline">
                  {new Date(status.connected_at).toLocaleDateString("pt-BR")}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              {disconnect.isPending ? (
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconPlugOff className="h-4 w-4 mr-2" />
              )}
              Desconectar
            </Button>
          </div>
        ) : (
          <Button asChild size="sm">
            <a href={authUrl}>
              <IconExternalLink className="h-4 w-4 mr-2" />
              Conectar com Notion
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export interface SyncResult {
  mode: string;
  total_notion_pages?: number;
  matched?: number;
  updated?: number;
  skipped?: number;
  not_found?: number;
  unmatched_titles?: string[];
  total_demands?: number;
  demands_with_notion?: number;
  total_comments_imported?: number;
  demands_processed?: number;
  errors?: string[];
  error?: string;
}

export type SyncStatus = "idle" | "running" | "success" | "error";

export function SyncResultDisplay({
  status,
  result,
}: {
  status: SyncStatus;
  result: SyncResult | null;
}) {
  if (status === "idle" || !result) return null;

  if (status === "error") {
    return (
      <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
        <div className="flex items-center gap-2">
          <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Erro na sincronizacao
          </p>
        </div>
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {result.error}
        </p>
        {result.errors && result.errors.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {result.errors.slice(0, 5).map((e, i) => (
              <li key={i} className="text-xs text-red-500">
                {e}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
      <div className="flex items-center gap-2 mb-2">
        <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Sincronizacao concluida
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {result.total_notion_pages !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {result.total_notion_pages} paginas no Notion
          </Badge>
        )}
        {result.matched !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {result.matched} encontradas
          </Badge>
        )}
        {result.updated !== undefined && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            {result.updated} atualizadas
          </Badge>
        )}
        {result.skipped !== undefined && result.skipped > 0 && (
          <Badge variant="secondary" className="text-xs">
            {result.skipped} sem alteracao
          </Badge>
        )}
        {result.not_found !== undefined && result.not_found > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          >
            {result.not_found} nao encontradas
          </Badge>
        )}
        {result.total_comments_imported !== undefined && (
          <Badge
            variant="secondary"
            className="text-xs bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200"
          >
            {result.total_comments_imported} comentarios importados
          </Badge>
        )}
        {result.demands_processed !== undefined && (
          <Badge variant="secondary" className="text-xs">
            {result.demands_processed} demandas processadas
          </Badge>
        )}
      </div>

      {result.unmatched_titles && result.unmatched_titles.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-900">
            {result.unmatched_titles.length} demandas sem correspondencia
          </summary>
          <ul className="mt-1 max-h-40 overflow-y-auto space-y-0.5 pl-2">
            {result.unmatched_titles.map((t, i) => (
              <li key={i} className="text-xs text-gray-500">
                {t}
              </li>
            ))}
          </ul>
        </details>
      )}

      {result.errors && result.errors.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800">
            {result.errors.length} avisos
          </summary>
          <ul className="mt-1 space-y-0.5">
            {result.errors.slice(0, 10).map((e, i) => (
              <li key={i} className="text-xs text-amber-500">
                {e}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
