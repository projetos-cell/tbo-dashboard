"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconRefresh, IconLoader2, IconEye, IconEyeOff, IconPlugConnected, IconCheck, IconX, IconInfoCircle } from "@tabler/icons-react";
import { useRdConfig, useSaveRdConfig, useRdSyncLogs, useTriggerRdSync, useTestRdConnection } from "@/features/comercial/hooks/use-rd-sync";
import { useToast } from "@/hooks/use-toast";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  running: { label: "Executando", variant: "secondary" },
  success: { label: "Sucesso", variant: "default" },
  partial: { label: "Parcial", variant: "outline" },
  error: { label: "Erro", variant: "destructive" },
};

export default function ComercialIntegracoes() {
  const { data: config } = useRdConfig();
  const { data: logs = [], isLoading: logsLoading } = useRdSyncLogs();
  const saveConfig = useSaveRdConfig();
  const triggerSync = useTriggerRdSync();
  const testConnection = useTestRdConnection();
  const { toast } = useToast();

  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenDirty, setTokenDirty] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const isConnected = config?.enabled && !!config?.api_token;

  function handleSaveToken() {
    saveConfig.mutate(
      { api_token: apiToken, enabled: true },
      {
        onSuccess: () => {
          setTokenDirty(false);
          toast({ title: "Token salvo", description: "Token do RD Station salvo com sucesso." });
        },
        onError: (err) => {
          toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
        },
      },
    );
  }

  function handleToggleEnabled(checked: boolean) {
    saveConfig.mutate({ enabled: checked });
  }

  async function handleTestConnection() {
    const token = apiToken || config?.api_token;
    if (!token) {
      toast({ title: "Token necessário", description: "Insira o token antes de testar.", variant: "destructive" });
      return;
    }
    setConnectionStatus("testing");
    testConnection.mutate(token, {
      onSuccess: (result) => {
        setConnectionStatus(result.ok ? "ok" : "error");
        if (result.ok) {
          toast({ title: "Conexão OK", description: "RD Station respondeu com sucesso." });
        } else {
          toast({ title: "Falha na conexão", description: result.error ?? "Erro desconhecido", variant: "destructive" });
        }
      },
      onError: () => setConnectionStatus("error"),
    });
  }

  function handleSync() {
    triggerSync.mutate(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Sync concluído",
          description: `${data.deals_synced ?? 0} deals sincronizados.`,
        });
      },
      onError: (err) => {
        toast({ title: "Erro no sync", description: err.message, variant: "destructive" });
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">Conexões com plataformas externas — sincronização unidirecional (read-only).</p>
      </div>

      {/* RD Station Config Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconPlugConnected className="h-4 w-4" />
              RD Station CRM
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500" : "bg-red-400"}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Sincronização unidirecional: dados fluem do RD Station para o TBO OS. Nenhuma alteração é enviada de volta ao RD Station.
            </p>
          </div>

          {/* API Token */}
          <div className="grid gap-2">
            <Label htmlFor="rd-token">API Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="rd-token"
                  type={showToken ? "text" : "password"}
                  placeholder={config?.api_token ? "••••••••••••" : "Cole o token da API do RD Station"}
                  value={apiToken}
                  onChange={(e) => { setApiToken(e.target.value); setTokenDirty(true); }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveToken} disabled={!tokenDirty || saveConfig.isPending}>
                {saveConfig.isPending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>

          {/* Toggle enabled */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Integração ativa</Label>
              <p className="text-xs text-muted-foreground">Habilita sincronização automática com RD Station</p>
            </div>
            <Switch checked={config?.enabled ?? false} onCheckedChange={handleToggleEnabled} />
          </div>

          {/* Test + Sync buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing" || (!apiToken && !config?.api_token)}
              className="flex-1"
            >
              {connectionStatus === "testing" ? (
                <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : connectionStatus === "ok" ? (
                <IconCheck className="mr-1.5 h-4 w-4 text-green-600" />
              ) : connectionStatus === "error" ? (
                <IconX className="mr-1.5 h-4 w-4 text-red-500" />
              ) : null}
              Testar Conexão
            </Button>
            <Button
              onClick={handleSync}
              disabled={!isConnected || triggerSync.isPending}
              className="flex-1"
            >
              {triggerSync.isPending ? (
                <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="mr-1.5 h-4 w-4" />
              )}
              Sincronizar Agora
            </Button>
          </div>

          {/* Last sync info */}
          {config?.last_sync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {new Date(config.last_sync).toLocaleString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Histórico de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : logs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma sincronização realizada ainda.</p>
              <p className="mt-1 text-xs text-muted-foreground">Configure o token acima e clique em "Sincronizar Agora".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Origem</th>
                    <th className="pb-2 font-medium text-right">Deals</th>
                    <th className="pb-2 font-medium text-right">Erros</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const badge = STATUS_BADGE[log.status] ?? STATUS_BADGE.error;
                    const errCount = log.errors?.length ?? 0;
                    return (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-2">{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                        <td className="py-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-2 capitalize text-muted-foreground">{log.trigger_source ?? "—"}</td>
                        <td className="py-2 text-right">{log.deals_synced}</td>
                        <td className="py-2 text-right">
                          {errCount > 0 ? (
                            <span className="text-red-500">{errCount}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
