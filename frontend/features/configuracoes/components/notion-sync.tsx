"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconRefresh,
  IconLoader2,
  IconDatabase,
  IconMessage,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNotionStatus, useNotionDisconnect } from "@/features/integrations/hooks/use-notion-integration";
import { SyncResultDisplay, NotionConnectionCard, type SyncResult, type SyncStatus } from "./notion-sync-result";

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

export function NotionSync() {
  const searchParams = useSearchParams();
  const notionParam = searchParams.get("notion");

  const { data: status, isLoading: statusLoading } = useNotionStatus();
  const disconnect = useNotionDisconnect();

  const [propStatus, setPropStatus] = useState<SyncStatus>("idle");
  const [propResult, setPropResult] = useState<SyncResult | null>(null);
  const [commentStatus, setCommentStatus] = useState<SyncStatus>("idle");
  const [commentResult, setCommentResult] = useState<SyncResult | null>(null);

  const [oauthBanner, setOauthBanner] = useState<"connected" | "error" | null>(null);
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
      setResult({ mode, error: err instanceof Error ? err.message : "Erro de rede" });
    }
  }, []);

  const connected = status?.connected ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notion</h2>
        <p className="text-sm text-gray-500">
          Sincronize dados de demandas do Notion com o dashboard.
        </p>
      </div>

      {oauthBanner === "connected" && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
          <IconCircleCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Workspace do Notion conectado com sucesso!
          </p>
        </div>
      )}
      {oauthBanner === "error" && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
          <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            Falha ao conectar com o Notion. Tente novamente.
          </p>
        </div>
      )}

      <NotionConnectionCard
        connected={connected}
        statusLoading={statusLoading}
        status={status}
        disconnect={disconnect}
        authUrl={buildAuthUrl()}
      />

      {connected && (
        <>
          <Separator />

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconDatabase className="h-4 w-4 text-blue-500" />
                <CardTitle className="text-sm font-medium">Sincronizar Propriedades</CardTitle>
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
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconRefresh className="h-4 w-4 mr-2" />
                )}
                {propStatus === "running" ? "Sincronizando..." : "Sincronizar Propriedades"}
              </Button>
              <SyncResultDisplay status={propStatus} result={propResult} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <IconMessage className="h-4 w-4 text-violet-500" />
                <CardTitle className="text-sm font-medium">Sincronizar Comentarios</CardTitle>
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
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconMessage className="h-4 w-4 mr-2" />
                )}
                {commentStatus === "running" ? "Importando..." : "Sincronizar Comentarios"}
              </Button>
              <SyncResultDisplay status={commentStatus} result={commentResult} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
