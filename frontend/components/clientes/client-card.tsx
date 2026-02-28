"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { CLIENT_STATUS, type ClientStatusKey } from "@/lib/constants";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ClientCardProps {
  client: ClientRow;
  onClick: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const statusConfig = CLIENT_STATUS[client.status as ClientStatusKey] ?? {
    label: client.status,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  };

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {client.logo_url ? (
            <img
              src={client.logo_url}
              alt={client.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{client.name}</p>
            {client.trading_name && (
              <p className="text-xs text-muted-foreground truncate">
                {client.trading_name}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </Badge>
          {client.segment && (
            <Badge variant="outline" className="text-xs">
              {client.segment}
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {client.contact_name && (
            <p className="truncate">{client.contact_name}</p>
          )}
          {client.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{client.phone}</span>
            </div>
          )}
          {(client.city || client.state) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {[client.city, client.state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
