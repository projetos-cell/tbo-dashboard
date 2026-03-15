"use client";

import { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUserStatus, useSetUserStatus, useClearUserStatus } from "@/features/chat/hooks/use-user-status";
import { SUGGESTED_STATUSES } from "@/features/chat/services/user-status";

type ExpiryKey = "never" | "30m" | "1h" | "4h" | "today" | "week";

function resolveExpiresAt(key: ExpiryKey): string | null {
  const now = new Date();
  switch (key) {
    case "30m": {
      now.setMinutes(now.getMinutes() + 30);
      return now.toISOString();
    }
    case "1h": {
      now.setHours(now.getHours() + 1);
      return now.toISOString();
    }
    case "4h": {
      now.setHours(now.getHours() + 4);
      return now.toISOString();
    }
    case "today": {
      now.setHours(23, 59, 59, 0);
      return now.toISOString();
    }
    case "week": {
      const day = now.getDay();
      const daysToFriday = day <= 5 ? 5 - day : 6;
      now.setDate(now.getDate() + daysToFriday);
      now.setHours(23, 59, 59, 0);
      return now.toISOString();
    }
    default:
      return null;
  }
}

interface UserStatusPickerProps {
  children: React.ReactNode;
}

export function UserStatusPicker({ children }: UserStatusPickerProps) {
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [text, setText] = useState("");
  const [expiry, setExpiry] = useState<ExpiryKey>("never");

  const { data: currentStatus } = useUserStatus();
  const setStatus = useSetUserStatus();
  const clearStatus = useClearUserStatus();

  function handleSave() {
    if (!text.trim() && !emoji) return;
    setStatus.mutate(
      {
        emoji: emoji || null,
        text: text.trim() || null,
        expiresAt: resolveExpiresAt(expiry),
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  function handleClear() {
    clearStatus.mutate(undefined, { onSuccess: () => setOpen(false) });
  }

  function handleOpen(v: boolean) {
    if (v) {
      setEmoji(currentStatus?.emoji ?? "");
      setText(currentStatus?.text ?? "");
      setExpiry("never");
    }
    setOpen(v);
  }

  const hasStatus = currentStatus?.text || currentStatus?.emoji;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-0">
        <div className="px-3 py-2.5 border-b flex items-center justify-between">
          <p className="text-sm font-medium">Definir status</p>
          {hasStatus && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearStatus.isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX size={12} />
              Limpar
            </button>
          )}
        </div>

        <div className="p-3 space-y-3">
          {/* Current status preview */}
          {hasStatus && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-sm">
              <span>{currentStatus.emoji}</span>
              <span className="truncate text-muted-foreground">{currentStatus.text}</span>
              <IconCheck size={14} className="ml-auto text-primary shrink-0" />
            </div>
          )}

          {/* Emoji + text input */}
          <div className="flex gap-2">
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="😊"
              className="w-14 text-center text-lg px-1"
              maxLength={4}
            />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que está acontecendo?"
              className="flex-1"
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Suggested statuses */}
          <div className="grid grid-cols-2 gap-1">
            {SUGGESTED_STATUSES.map((s) => (
              <button
                key={s.text}
                type="button"
                onClick={() => { setEmoji(s.emoji); setText(s.text); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-left transition-colors",
                  emoji === s.emoji && text === s.text
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground",
                )}
              >
                <span>{s.emoji}</span>
                <span className="truncate">{s.text}</span>
              </button>
            ))}
          </div>

          <Separator />

          {/* Expiry */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Limpar status automaticamente</Label>
            <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryKey)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Não expirar</SelectItem>
                <SelectItem value="30m">Em 30 minutos</SelectItem>
                <SelectItem value="1h">Em 1 hora</SelectItem>
                <SelectItem value="4h">Em 4 horas</SelectItem>
                <SelectItem value="today">Fim do dia de hoje</SelectItem>
                <SelectItem value="week">Fim desta semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={handleSave}
            disabled={(!text.trim() && !emoji) || setStatus.isPending}
          >
            {setStatus.isPending ? "Salvando..." : "Salvar status"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
