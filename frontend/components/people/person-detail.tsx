"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PEOPLE_STATUS, BU_COLORS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
} from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface PersonDetailProps {
  person: ProfileRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonDetail({ person, open, onOpenChange }: PersonDetailProps) {
  if (!person) return null;

  const statusCfg = PEOPLE_STATUS[person.status as keyof typeof PEOPLE_STATUS];
  const buColor = person.bu ? BU_COLORS[person.bu] : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={person.avatar_url ?? undefined} />
              <AvatarFallback>{getInitials(person.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{person.full_name ?? "Sem nome"}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {person.cargo ?? "—"}
              </p>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Detalhes do membro da equipe
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-4">
          {/* Status & BU */}
          <div className="flex flex-wrap gap-2">
            {statusCfg && (
              <Badge
                variant="secondary"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
              >
                {statusCfg.label}
              </Badge>
            )}
            {person.bu && (
              <Badge
                variant="secondary"
                style={
                  buColor
                    ? { backgroundColor: buColor.bg, color: buColor.color }
                    : undefined
                }
              >
                {person.bu}
              </Badge>
            )}
            {person.is_coordinator && (
              <Badge variant="default">Coordenador</Badge>
            )}
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-3 text-sm">
            {person.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{person.email}</span>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{person.phone}</span>
              </div>
            )}
            {(person.address_city || person.address_state) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[person.address_city, person.address_state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Professional info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" /> Departamento
              </p>
              <span>{person.department ?? "—"}</span>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> Contrato
              </p>
              <span>{person.contract_type ?? "—"}</span>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Início
              </p>
              <span>
                {person.start_date
                  ? format(new Date(person.start_date + "T12:00:00"), "dd MMM yyyy", {
                      locale: ptBR,
                    })
                  : "—"}
              </span>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Aniversário
              </p>
              <span>
                {person.birth_date
                  ? format(new Date(person.birth_date + "T12:00:00"), "dd MMM", {
                      locale: ptBR,
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
