"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateTicket } from "@/features/helpdesk/hooks/use-helpdesk";
import { TicketStatusBadge, TicketPriorityBadge, STATUS_CONFIG } from "./ticket-status-badge";
import { TicketComments } from "./ticket-comments";
import { IconCalendar, IconTag, IconUser } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { HelpdeskTicket, TicketStatus } from "@/features/helpdesk/services/helpdesk";

interface TicketDetailProps {
  ticket: HelpdeskTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetail({ ticket, open, onOpenChange }: TicketDetailProps) {
  const role = useAuthStore((s) => s.role) ?? "colaborador";
  const isStaff = ["founder", "diretoria", "lider"].includes(role);
  const updateTicket = useUpdateTicket();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!ticket) return null;

  const handleStatusChange = async (status: TicketStatus) => {
    setUpdatingStatus(true);
    try {
      const updates: Record<string, string | null> = { status };
      if (status === "resolvido") updates.resolved_at = new Date().toISOString();
      if (status === "fechado") updates.closed_at = new Date().toISOString();
      await updateTicket.mutateAsync({ id: ticket.id, updates });
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const createdAt = ticket.created_at
    ? format(new Date(ticket.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })
    : "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base leading-snug">{ticket.title}</SheetTitle>
          <div className="flex flex-wrap gap-2 pt-1">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </SheetHeader>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <MetaRow icon={<IconTag className="h-3.5 w-3.5" />} label="Categoria">
            {ticket.category}
          </MetaRow>
          <MetaRow icon={<IconCalendar className="h-3.5 w-3.5" />} label="Aberto em">
            {createdAt}
          </MetaRow>
          <MetaRow icon={<IconUser className="h-3.5 w-3.5" />} label="Solicitante">
            {ticket.creator?.full_name ?? "—"}
          </MetaRow>
          <MetaRow icon={<IconUser className="h-3.5 w-3.5" />} label="Responsável">
            {ticket.assignee?.full_name ?? "Não atribuído"}
          </MetaRow>
        </div>

        {/* Description */}
        {ticket.description && (
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Descrição
            </p>
            <p className="text-sm whitespace-pre-wrap text-foreground/80">
              {ticket.description}
            </p>
          </div>
        )}

        {/* Staff: change status */}
        {isStaff && ticket.status !== "fechado" && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Alterar status
            </p>
            <Select
              value={ticket.status}
              onValueChange={(v) => handleStatusChange(v as TicketStatus)}
              disabled={updatingStatus}
            >
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Requester: close ticket */}
        {!isStaff && ticket.status === "resolvido" && (
          <div className="mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("fechado")}
              disabled={updatingStatus}
            >
              Confirmar resolução e fechar chamado
            </Button>
          </div>
        )}

        <Separator className="my-4" />

        {/* Comments */}
        <TicketComments ticketId={ticket.id} />
      </SheetContent>
    </Sheet>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}
