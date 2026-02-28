"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PEOPLE_STATUS, BU_COLORS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { Mail, Phone } from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface PersonCardProps {
  person: ProfileRow;
  onClick?: () => void;
}

export function PersonCard({ person, onClick }: PersonCardProps) {
  const statusCfg = PEOPLE_STATUS[person.status as keyof typeof PEOPLE_STATUS];
  const buColor = person.bu ? BU_COLORS[person.bu] : undefined;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={person.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(person.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {person.full_name ?? "Sem nome"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {person.cargo ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {statusCfg && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          )}
          {person.bu && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={buColor ? { backgroundColor: buColor.bg, color: buColor.color } : undefined}
            >
              {person.bu}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {person.email && (
            <span className="flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{person.email}</span>
            </span>
          )}
          {person.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              {person.phone}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
