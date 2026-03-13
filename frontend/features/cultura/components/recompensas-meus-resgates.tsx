"use client";

import { Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type RedemptionRow = Database["public"]["Tables"]["recognition_redemptions"]["Row"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#f59e0b" },
  approved: { label: "Aprovado", color: "#22c55e" },
  rejected: { label: "Rejeitado", color: "#ef4444" },
  delivered: { label: "Entregue", color: "#3b82f6" },
};

interface RecompensasMeusResgatesProps {
  redemptions: RedemptionRow[];
  onGoToCatalog: () => void;
}

export function RecompensasMeusResgates({
  redemptions,
  onGoToCatalog,
}: RecompensasMeusResgatesProps) {
  if (redemptions.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="Nenhum resgate ainda"
        description="Explore o catalogo e resgate recompensas com seus pontos!"
        cta={{ label: "Ver catalogo", onClick: onGoToCatalog }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {redemptions.map((r) => {
        const statusInfo =
          STATUS_LABELS[r.status ?? "pending"] ?? STATUS_LABELS.pending;
        return (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {(r as Record<string, unknown>).notes
                    ? String((r as Record<string, unknown>).notes)
                    : `Resgate #${r.id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.points_spent} pontos
                  {r.created_at && (
                    <>
                      {" "}
                      &middot;{" "}
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </>
                  )}
                </p>
              </div>
              <Badge
                variant="outline"
                style={{
                  color: statusInfo.color,
                  borderColor: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
