import { Badge } from "@/components/ui/badge";
import type { TicketStatus, TicketPriority } from "@/features/helpdesk/services/helpdesk";

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  aberto:       { label: "Aberto",       color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  em_andamento: { label: "Em andamento", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  aguardando:   { label: "Aguardando",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  resolvido:    { label: "Resolvido",    color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  fechado:      { label: "Fechado",      color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; bg: string }> = {
  baixa:   { label: "Baixa",   color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
  media:   { label: "Média",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  alta:    { label: "Alta",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  urgente: { label: "Urgente", color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.aberto;
  return (
    <Badge
      variant="secondary"
      className="text-xs"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </Badge>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.media;
  return (
    <Badge
      variant="secondary"
      className="text-xs"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </Badge>
  );
}

export { STATUS_CONFIG, PRIORITY_CONFIG };
