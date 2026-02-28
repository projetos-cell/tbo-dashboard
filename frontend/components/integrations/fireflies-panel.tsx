"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Loader2, Eye, EyeOff, Mic } from "lucide-react";
import { useFirefliesSyncLogs, useTriggerFirefliesSync, useFirefliesConfig, useSaveFirefliesConfig } from "@/hooks/use-fireflies-sync";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  running: { label: "Executando", variant: "secondary" },
  success: { label: "Sucesso", variant: "default" },
  error: { label: "Erro", variant: "destructive" },
};

export function FirefliesPanel() {
  const { data: logs = [], isLoading: logsLoading } = useFirefliesSyncLogs();
  const { data: config } = useFirefliesConfig();
  const triggerSync = useTriggerFirefliesSync();
  const saveConfig = useSaveFirefliesConfig();

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyDirty, setKeyDirty] = useState(false);

  const isConnected = config?.enabled && !!config?.api_key;

  function handleSaveKey() {
    saveConfig.mutate(
      { api_key: apiKey, enabled: true },
      { onSuccess: () => setKeyDirty(false) },
    );
  }

  function handleToggleEnabled(checked: boolean) {
    saveConfig.mutate({ enabled: checked });
  }

  function handleToggleAutoSync(checked: boolean) {
    saveConfig.mutate({ auto_sync: checked });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mic className="h-4 w-4" />
              Fireflies.ai
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
            <Label htmlFor="ff-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="ff-key"
                  type={showKey ? "text" : "password"}
                  placeholder={config?.api_key ? "••••••••••••" : "Cole a API key aqui"}
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setKeyDirty(true); }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveKey} disabled={!keyDirty || saveConfig.isPending}>
                {saveConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Integracao ativa</Label>
              <p className="text-xs text-muted-foreground">Habilita sincronizacao com Fireflies</p>
            </div>
            <Switch checked={config?.enabled ?? false} onCheckedChange={handleToggleEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-sync</Label>
              <p className="text-xs text-muted-foreground">Sincronizar automaticamente apos reunioes</p>
            </div>
            <Switch checked={config?.auto_sync ?? false} onCheckedChange={handleToggleAutoSync} />
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
                    <th className="pb-2 font-medium text-right">Reunioes</th>
                    <th className="pb-2 font-medium text-right">Transcritos</th>
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
                        <td className="py-2 text-right">{log.meetings_synced}</td>
                        <td className="py-2 text-right">{log.transcripts_synced}</td>
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
