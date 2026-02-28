"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Check, X, Loader2, Eye, EyeOff, Plug } from "lucide-react";
import { useRdSyncLogs, useTriggerRdSync, useRdConfig, useSaveRdConfig } from "@/hooks/use-rdstation";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  running: { label: "Executando", variant: "secondary" },
  success: { label: "Sucesso", variant: "default" },
  error: { label: "Erro", variant: "destructive" },
};

export function RdStationPanel() {
  const { data: logs = [], isLoading: logsLoading } = useRdSyncLogs();
  const { data: config } = useRdConfig();
  const triggerSync = useTriggerRdSync();
  const saveConfig = useSaveRdConfig();

  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenDirty, setTokenDirty] = useState(false);

  const isConnected = config?.enabled && !!config?.api_token;

  function handleSaveToken() {
    saveConfig.mutate(
      { api_token: token, enabled: true },
      { onSuccess: () => setTokenDirty(false) },
    );
  }

  function handleToggleEnabled(checked: boolean) {
    saveConfig.mutate({ enabled: checked });
  }

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plug className="h-4 w-4" />
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
          <div className="grid gap-2">
            <Label htmlFor="rd-token">API Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="rd-token"
                  type={showToken ? "text" : "password"}
                  placeholder={config?.api_token ? "••••••••••••" : "Cole o token aqui"}
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setTokenDirty(true); }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveToken} disabled={!tokenDirty || saveConfig.isPending}>
                {saveConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Integração ativa</Label>
              <p className="text-xs text-muted-foreground">Habilita a sincronização com o RD Station</p>
            </div>
            <Switch checked={config?.enabled ?? false} onCheckedChange={handleToggleEnabled} />
          </div>

          <Button
            onClick={() => triggerSync.mutate()}
            disabled={!isConnected || triggerSync.isPending}
            className="w-full"
          >
            {triggerSync.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-4 w-4" />
            )}
            Sincronizar Agora
          </Button>
        </CardContent>
      </Card>

      {/* Sync Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historico de Sincronizacao</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sincronizacao realizada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Deals</th>
                    <th className="pb-2 font-medium text-right">Contatos</th>
                    <th className="pb-2 font-medium text-right">Orgs</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const badge = STATUS_BADGE[log.status] ?? STATUS_BADGE.error;
                    return (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-2">{new Date(log.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="py-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="py-2 text-right">{log.deals_synced}</td>
                        <td className="py-2 text-right">{log.contacts_synced}</td>
                        <td className="py-2 text-right">{log.organizations_synced}</td>
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
