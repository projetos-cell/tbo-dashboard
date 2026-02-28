"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Database,
  MessageSquare,
  ExternalLink,
  Unplug,
  Plug,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotionStatus, useNotionDisconnect } from "@/hooks/use-notion-integration";

const CLIENT_ID = (process.env.NEXT_PUBLIC_NOTION_CLIENT_ID ?? "").trim();
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();

function buildAuthUrl() {
  const redirectUri = `${APP_URL}/api/notion/callback`;
  return (
    `https://api.notion.com/v1/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&owner=user` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

interface SyncResult {
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

type SyncStatus = "idle" | "running" | "success" | "error";

export function NotionSync() {
  const searchParams = useSearchParams();
  const notionParam = searchParams.get("notion");

  const { data: status, isLoading: statusLoading } = useNotionStatus();
  const disconnect = useNotionDisconnect();

  const [propStatus, setPropStatus] = useState<SyncStatus>("idle");
  const [propResult, setPropResult] = useState<SyncResult | null>(null);
  const [commentStatus, setCommentStatus] = useState<SyncStatus>("idle");
  const [commentResult, setCommentResult] = useState<SyncResult | null>(null);

  // Show toast-like banner when returning from OAuth
  const [oauthBanner, setOauthBanner] = useState<"connected" | "error" | null>(
    null
  );
  useEffect(() => {
    if (notionParam === "connected") setOauthBanner("connected");
    else if (notionParam && notionParam !== "connected") setOauthBanner("error");
  }, [notionParam]);

  const runSync = useCallback(async (mode: "properties" | "comments") => {
    const setStatus = mode === "properties" ? setPropStatus : setCommentStatus;
    const setResult = mode === "properties" ? setPropResult : setCommentResult;

    setStatus("running");
    setResult(null);

    try {
      const params = new URLSearchParams({ mode });
      if (mode === "comments") params.set("limit", "100");

      const res = await fetch(`/api/notion/sync?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setResult({ mode, error: data.error ?? `HTTP ${res.status}` });
        return;
      }

      setStatus("success");
      setResult(data);
    } catch (err) {
      setStatus("error");
      setResult({
        mode,
        error: err instanceof Error ? err.message : "Erro de rede",
      });
    }
  }, []);

  const connected = status?.connected ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notion</h2>
        <p className="text-sm text-muted-foreground">
          Sincronize dados de demandas do Notion com o dashboard.
        </p>
      </div>

      {/* OAuth result banner */}
      {oauthBanner === "connected" && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Workspace do Notion conectado com sucesso!
          </p>
        </div>
      )}
      {oauthBanner === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Falha ao conectar com o Notion. Tente novamente.
          </p>
        </div>
      )}

      {/* Connection status card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Plug className="h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando conexao...
            </div>
          ) : connected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {status?.workspace_name && (
                  <Badge variant="secondary">
                    Workspace: {status.workspace_name}
                  </Badge>
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4 mr-2" />
                )}
                Desconectar
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <a href={buildAuthUrl()}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Conectar com Notion
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {connected && (
        <>
          <Separator />

          {/* Properties sync */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm font-medium">
                  Sincronizar Propriedades
                </CardTitle>
              </div>
              <CardDescription>
                Importa datas (inicio, prazo, fim), status, prioridade,
                responsavel, BUs, tags e mais de cada demanda no Notion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runSync("properties")}
                disabled={propStatus === "running"}
                size="sm"
              >
                {propStatus === "running" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {propStatus === "running"
                  ? "Sincronizando..."
                  : "Sincronizar Propriedades"}
              </Button>

              <SyncResultDisplay status={propStatus} result={propResult} />
            </CardContent>
          </Card>

          {/* Comments sync */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-violet-500" />
                <CardTitle className="text-sm font-medium">
                  Sincronizar Comentarios
                </CardTitle>
              </div>
              <CardDescription>
                Importa comentarios de cada pagina de demanda no Notion para a
                tabela de comentarios do dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runSync("comments")}
                disabled={commentStatus === "running"}
                variant="outline"
                size="sm"
              >
                {commentStatus === "running" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                {commentStatus === "running"
                  ? "Importando..."
                  : "Sincronizar Comentarios"}
              </Button>

              <SyncResultDisplay
                status={commentStatus}
                result={commentResult}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/* ─── result display ──────────────────────────────────────────────── */

function SyncResultDisplay({
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
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
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
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
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
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            {result.unmatched_titles.length} demandas sem correspondencia
          </summary>
          <ul className="mt-1 max-h-40 overflow-y-auto space-y-0.5 pl-2">
            {result.unmatched_titles.map((t, i) => (
              <li key={i} className="text-xs text-muted-foreground">
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
