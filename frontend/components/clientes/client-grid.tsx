"use client";

import { Building2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { ClientCard } from "./client-card";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ClientGridProps {
  clients: ClientRow[];
  isLoading: boolean;
  onSelect: (client: ClientRow) => void;
}

export function ClientGrid({ clients, isLoading, onSelect }: ClientGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">Nenhum cliente encontrado</p>
        <p className="text-xs text-muted-foreground">
          Ajuste os filtros ou adicione novos clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onClick={() => onSelect(client)}
        />
      ))}
    </div>
  );
}
