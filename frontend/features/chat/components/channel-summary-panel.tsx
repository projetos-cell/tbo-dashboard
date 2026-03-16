"use client";

/**
 * Feature #45 — "O que perdi?" — AI summary panel for a channel
 */

import { useState } from "react";
import {
  IconSparkles,
  IconX,
  IconRefresh,
  IconMessageCircle2,
  IconCheck,
  IconAlertCircle,
  IconList,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useChannelSummary, type ChannelSummary } from "@/features/chat/hooks/use-channel-summary";

interface ChannelSummaryPanelProps {
  channelId: string;
  channelName?: string;
  onClose: () => void;
}

const PERIOD_OPTIONS = [
  { label: "Última hora", hours: 1 },
  { label: "Últimas 4h", hours: 4 },
  { label: "Hoje", hours: 24 },
  { label: "Últimos 3 dias", hours: 72 },
] as const;

export function ChannelSummaryPanel({
  channelId,
  channelName,
  onClose,
}: ChannelSummaryPanelProps) {
  const [selectedHours, setSelectedHours] = useState(24);
  const { mutate, data, isPending, isError } = useChannelSummary();

  function handleGenerate() {
    const since = new Date(Date.now() - selectedHours * 60 * 60 * 1000).toISOString();
    mutate({ channelId, since, limit: 150 });
  }

  return (
    <div className="flex h-full flex-col border-l bg-background w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <IconSparkles size={16} className="text-primary" />
          <span className="text-sm font-semibold">O que perdi?</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <IconX size={14} />
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
        {/* Period selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Período
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                type="button"
                onClick={() => setSelectedHours(opt.hours)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedHours === opt.hours
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          className="w-full gap-2"
          onClick={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <IconSparkles size={14} className="animate-pulse" />
              Gerando resumo...
            </>
          ) : data ? (
            <>
              <IconRefresh size={14} />
              Gerar novamente
            </>
          ) : (
            <>
              <IconSparkles size={14} />
              Gerar resumo com IA
            </>
          )}
        </Button>

        {/* Loading skeleton */}
        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <IconAlertCircle size={14} />
            Erro ao gerar resumo. Tente novamente.
          </div>
        )}

        {/* Result */}
        {data && !isPending && (
          data.message_count === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              Nenhuma mensagem neste período.
            </div>
          ) : (
            <SummaryResult summary={data.summary} count={data.message_count} />
          )
        )}
      </div>

      {/* Footer */}
      {channelName && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Canal: #{channelName}
        </div>
      )}
    </div>
  );
}

function SummaryResult({
  summary,
  count,
}: {
  summary: ChannelSummary | null;
  count: number;
}) {
  if (!summary) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconMessageCircle2 size={12} />
        <span>
          Baseado em {count} mensagem{count !== 1 ? "s" : ""}
          {summary.period_label ? ` — ${summary.period_label}` : ""}
        </span>
      </div>

      {summary.topics.length > 0 && (
        <Section
          icon={<IconList size={13} />}
          title="Tópicos discutidos"
          items={summary.topics}
          color="blue"
        />
      )}

      {summary.decisions.length > 0 && (
        <Section
          icon={<IconCheck size={13} />}
          title="Decisões"
          items={summary.decisions}
          color="green"
        />
      )}

      {summary.action_items.length > 0 && (
        <Section
          icon={<IconAlertCircle size={13} />}
          title="Pendências / Próximos passos"
          items={summary.action_items}
          color="amber"
        />
      )}

      {summary.highlights.length > 0 && (
        <Section
          icon={<IconSparkles size={13} />}
          title="Destaques"
          items={summary.highlights}
          color="purple"
        />
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    green: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  };

  return (
    <div className={cn("rounded-lg p-3", colorMap[color])}>
      <div className="flex items-center gap-1.5 mb-2 font-medium text-xs">
        {icon}
        <span>{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-foreground/80 pl-2 border-l-2 border-current/30">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
