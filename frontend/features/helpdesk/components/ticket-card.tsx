"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { TicketStatusBadge, TicketPriorityBadge } from "./ticket-status-badge";
import { IconMessageCircle, IconTag } from "@tabler/icons-react";
import type { HelpdeskTicket } from "@/features/helpdesk/services/helpdesk";

interface TicketCardProps {
  ticket: HelpdeskTicket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const createdAt = ticket.created_at
    ? formatDistanceToNow(new Date(ticket.created_at), { locale: ptBR, addSuffix: true })
    : "";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{ticket.title}</p>
            {ticket.description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {ticket.description}
              </p>
            )}
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        {/* Footer row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TicketPriorityBadge priority={ticket.priority} />

          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconTag className="h-3 w-3" />
            {ticket.category}
          </span>

          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {ticket.assignee?.full_name ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={ticket.assignee.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[9px]">
                    {getInitials(ticket.assignee.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">
                  {ticket.assignee.full_name}
                </span>
              </>
            ) : (
              <span className="italic">Não atribuído</span>
            )}
          </span>
        </div>

        {/* Timestamp */}
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/70">
          <IconMessageCircle className="h-3 w-3" />
          <span>{createdAt}</span>
        </div>
      </CardContent>
    </Card>
  );
}
