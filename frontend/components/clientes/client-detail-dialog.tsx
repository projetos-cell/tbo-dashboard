"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { CLIENT_STATUS, type ClientStatusKey, INTERACTION_TYPES, type InteractionTypeKey } from "@/lib/constants";
import { useClientInteractions } from "@/hooks/use-clients";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ClientDetailDialogProps {
  client: ClientRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (client: ClientRow) => void;
}

export function ClientDetailDialog({
  client,
  open,
  onOpenChange,
  onEdit,
}: ClientDetailDialogProps) {
  const { data: interactions = [] } = useClientInteractions(client?.id);

  if (!client) return null;

  const statusConfig = CLIENT_STATUS[client.status as ClientStatusKey] ?? {
    label: client.status,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start gap-3">
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt={client.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <SheetTitle className="text-left">{client.name}</SheetTitle>
              {client.trading_name && (
                <p className="text-sm text-muted-foreground">
                  {client.trading_name}
                </p>
              )}
              <Badge
                variant="secondary"
                className="mt-1"
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Contact info */}
          <div className="space-y-2 text-sm">
            {client.contact_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{client.contact_name}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {(client.city || client.state) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[client.address, client.city, client.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            {client.cnpj && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>CNPJ: {client.cnpj}</span>
              </div>
            )}
          </div>

          {/* CRM Info */}
          {(client.sales_owner || client.next_action) && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">CRM</h4>
                {client.sales_owner && (
                  <p>
                    <span className="text-muted-foreground">Responsável: </span>
                    {client.sales_owner}
                  </p>
                )}
                {client.relationship_status && (
                  <p>
                    <span className="text-muted-foreground">Relacionamento: </span>
                    {client.relationship_status}
                  </p>
                )}
                {client.next_action && (
                  <p>
                    <span className="text-muted-foreground">Próxima ação: </span>
                    {client.next_action}
                    {client.next_action_date && (
                      <span className="ml-1 text-muted-foreground">
                        ({new Date(client.next_action_date).toLocaleDateString("pt-BR")})
                      </span>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {client.notes && (
            <>
              <Separator />
              <div className="space-y-1 text-sm">
                <h4 className="font-medium">Observações</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {client.notes}
                </p>
              </div>
            </>
          )}

          {/* Interactions */}
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Interações ({interactions.length})
            </h4>
            {interactions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma interação registrada.
              </p>
            ) : (
              <div className="space-y-2">
                {interactions.slice(0, 10).map((i) => {
                  const typeConfig =
                    INTERACTION_TYPES[i.type as InteractionTypeKey];
                  return (
                    <div
                      key={i.id}
                      className="flex items-start gap-2 rounded-md border p-2 text-sm"
                    >
                      <Calendar className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {typeConfig?.label ?? i.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(i.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {i.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {i.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          {onEdit && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onEdit(client)}
              >
                Editar Cliente
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
