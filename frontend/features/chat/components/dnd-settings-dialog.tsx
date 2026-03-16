"use client";

import { useState, useEffect } from "react";
import { IconBellOff, IconBell, IconClock } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDndSettings, useSetDndSettings } from "@/features/chat/hooks/use-dnd";
import { useAwaySettings, useSetAwaySettings } from "@/features/chat/hooks/use-away-timer";
import { isDndActiveNow, AWAY_TIMEOUT_OPTIONS } from "@/features/chat/services/chat-dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DndSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DndSettingsDialog({ open, onOpenChange }: DndSettingsDialogProps) {
  const { data: dndSettings } = useDndSettings();
  const { data: awaySettings } = useAwaySettings();
  const setDnd = useSetDndSettings();
  const setAway = useSetAwaySettings();

  // Local state mirrors fetched settings
  const [dndEnabled, setDndEnabled] = useState(false);
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("08:00");
  const [awayTimeout, setAwayTimeout] = useState(10);

  useEffect(() => {
    if (dndSettings) {
      setDndEnabled(dndSettings.enabled);
      setStartTime(dndSettings.startTime);
      setEndTime(dndSettings.endTime);
    }
  }, [dndSettings]);

  useEffect(() => {
    if (awaySettings) {
      setAwayTimeout(awaySettings.timeoutMinutes);
    }
  }, [awaySettings]);

  const isCurrentlyActive = dndEnabled && isDndActiveNow({ enabled: dndEnabled, startTime, endTime });

  function handleSave() {
    setDnd.mutate({ enabled: dndEnabled, startTime, endTime });
    setAway.mutate({ timeoutMinutes: awayTimeout });
    onOpenChange(false);
  }

  const isPending = setDnd.isPending || setAway.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBellOff size={18} />
            Preferências de Presença
          </DialogTitle>
          <DialogDescription>
            Configure Não Perturbe e ausência automática.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ── Do Not Disturb ────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <IconBellOff size={14} />
                  Não Perturbe
                  {isCurrentlyActive && (
                    <Badge variant="secondary" className="text-xs py-0">Ativo agora</Badge>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Silencia todas as notificações no período configurado.
                </p>
              </div>
              <Switch
                checked={dndEnabled}
                onCheckedChange={setDndEnabled}
                aria-label="Ativar Não Perturbe"
              />
            </div>

            {dndEnabled && (
              <div className="ml-4 space-y-2 border-l pl-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Início</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Fim</Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <IconClock size={11} />
                  {startTime > endTime
                    ? `Das ${startTime} (hoje) até ${endTime} (amanhã)`
                    : `Das ${startTime} às ${endTime}`}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Away automático ──────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <IconBell size={14} />
              Ausência automática
            </Label>
            <p className="text-xs text-muted-foreground">
              Marcar como ausente após período sem atividade.
            </p>
            <Select
              value={String(awayTimeout)}
              onValueChange={(v) => setAwayTimeout(Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AWAY_TIMEOUT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
