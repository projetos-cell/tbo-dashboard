"use client";

import { useState, useEffect } from "react";
import {
  IconActivity,
  IconCheck,
  IconX,
  IconClock,
  IconMessageCircle,
  IconRefresh,
} from "@tabler/icons-react";
interface PortalTimelineItem {
  id: string;
  type: "status_update" | "approval" | "comment";
  title: string;
  description: string | null;
  status: string | null;
  author: string | null;
  created_at: string;
}

const EVENT_CONFIG: Record<
  string,
  { icon: typeof IconActivity; color: string; dot: string }
> = {
  status_update: {
    icon: IconActivity,
    color: "text-blue-500",
    dot: "bg-blue-500",
  },
  approval: {
    icon: IconClock,
    color: "text-amber-500",
    dot: "bg-amber-400",
  },
  comment: {
    icon: IconMessageCircle,
    color: "text-violet-500",
    dot: "bg-violet-500",
  },
};

const APPROVAL_ICONS: Record<
  string,
  { icon: typeof IconCheck; color: string; dot: string }
> = {
  approved: {
    icon: IconCheck,
    color: "text-green-600",
    dot: "bg-green-500",
  },
  rejected: { icon: IconX, color: "text-red-600", dot: "bg-red-500" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  on_track: { label: "No prazo", color: "#22c55e" },
  at_risk: { label: "Em risco", color: "#f59e0b" },
  off_track: { label: "Atrasado", color: "#ef4444" },
  on_hold: { label: "Pausado", color: "#6b7280" },
  complete: { label: "Concluido", color: "#3b82f6" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PortalTimelineProps {
  token: string;
}

export function PortalTimeline({ token }: PortalTimelineProps) {
  const [items, setItems] = useState<PortalTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTimeline() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/timeline?token=${token}`);
      if (!res.ok) throw new Error("Erro ao carregar timeline");
      const data = (await res.json()) as { items: PortalTimelineItem[] };
      setItems(data.items);
    } catch {
      setError("Nao foi possivel carregar a timeline");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-[#e5e7eb]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#e5e7eb]" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-[#e5e7eb]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 text-center">
        <p className="text-sm text-[#9ca3af] mb-3">{error}</p>
        <button
          onClick={() => fetchTimeline()}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#d1d5db] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
        >
          <IconRefresh className="size-3.5" />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#d1d5db] bg-white p-8 text-center">
        <IconClock className="mx-auto mb-2 size-8 text-[#9ca3af]" />
        <p className="text-sm font-medium text-[#4a5f7a]">
          Nenhum evento registrado
        </p>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Atualizacoes, aprovacoes e comentarios aparecerao aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isApprovalDecision =
          item.type === "approval" &&
          (item.status === "approved" || item.status === "rejected");

        const config = isApprovalDecision
          ? APPROVAL_ICONS[item.status!]
          : EVENT_CONFIG[item.type] ?? EVENT_CONFIG.comment;

        const Icon = config.icon;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex gap-3">
            {/* Timeline dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.dot} shadow-sm`}
              >
                <Icon className="size-3.5 text-white" />
              </div>
              {!isLast && (
                <div className="my-1 w-px flex-1 bg-[#e5e7eb]" />
              )}
            </div>

            {/* Content */}
            <div className={`min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-[#1a1a2e]">
                  {item.title}
                </p>
                {item.type === "status_update" &&
                  item.status &&
                  STATUS_LABELS[item.status] && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{
                        backgroundColor:
                          STATUS_LABELS[item.status].color,
                      }}
                    >
                      {STATUS_LABELS[item.status].label}
                    </span>
                  )}
              </div>

              {item.description && (
                <p className="mt-0.5 text-sm text-[#4a5f7a] line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="mt-1 flex items-center gap-2 text-xs text-[#9ca3af]">
                <span>{formatDate(item.created_at)}</span>
                {item.author && (
                  <>
                    <span>&middot;</span>
                    <span>{item.author}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
