"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBuilding, IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <IconBuilding className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{client.name}</p>
            {client.trading_name && (
              <p className="text-xs text-gray-500 truncate">
                {client.trading_name}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </Badge>
          {client.source && client.source !== "manual" && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal text-gray-400">
              {client.source === "omie" ? "Omie" : client.source === "merged" ? "Omie+CRM" : client.source === "crm" ? "CRM" : client.source}
            </Badge>
          )}
          {client.segment && (
            <Badge variant="outline" className="text-xs">
              {client.segment}
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-1 text-xs text-gray-500">
          {client.contact_name && (
            <p className="truncate">{client.contact_name}</p>
          )}
          {client.email && (
            <div className="flex items-center gap-1">
              <IconMail className="h-3 w-3" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1">
              <IconPhone className="h-3 w-3" />
              <span>{client.phone}</span>
            </div>
          )}
          {(client.city || client.state) && (
            <div className="flex items-center gap-1">
              <IconMapPin className="h-3 w-3" />
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
