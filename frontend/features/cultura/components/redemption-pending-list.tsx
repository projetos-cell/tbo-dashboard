import { IconCircleCheck, IconClock, IconCircleX, IconPackages } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared";

interface Redemption {
  id: string;
  user_id: string;
  points_spent: number;
  status: string | null;
  created_at: string | null;
  notes?: unknown;
}

interface RedemptionPendingListProps {
  redemptions: Redemption[];
  userMap: Map<string, string>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeliver?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "#f59e0b", icon: IconClock },
  approved: { label: "Aprovado", color: "#22c55e", icon: IconCircleCheck },
  rejected: { label: "Rejeitado", color: "#ef4444", icon: IconCircleX },
  delivered: { label: "Entregue", color: "#3b82f6", icon: IconPackages },
};

export function RedemptionPendingList({
  redemptions,
  userMap,
  onApprove,
  onReject,
  onDeliver,
}: RedemptionPendingListProps) {
  // Show pending first, then approved (awaiting delivery), then others
  const getStatusOrder = (status: string | null): number => {
    if (status === "pending") return 0;
    if (status === "approved") return 1;
    if (status === "delivered") return 2;
    if (status === "rejected") return 3;
    return 4;
  };
  const sorted = [...redemptions].sort(
    (a, b) => getStatusOrder(a.status) - getStatusOrder(b.status)
  );

  const pending = redemptions.filter((r) => r.status === "pending");
  const approved = redemptions.filter((r) => r.status === "approved");

  return (
    <div className="space-y-4">
      {/* Pending approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconClock className="size-4 text-amber-500" />
            Aguardando Aprovacao
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pending.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length > 0 ? (
            <div className="space-y-2">
              {pending.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {userMap.get(r.user_id) ?? r.user_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.notes
                        ? String(r.notes)
                        : `Resgate #${r.id.slice(0, 8)}`}{" "}
                      &middot; {r.points_spent} pts &middot;{" "}
                      {r.created_at &&
                        new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onApprove(r.id)}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReject(r.id)}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconCircleCheck}
              title="Nenhum resgate pendente"
              description="Todos os resgates foram revisados."
            />
          )}
        </CardContent>
      </Card>

      {/* Approved — awaiting delivery */}
      {approved.length > 0 && onDeliver && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconPackages className="size-4 text-green-500" />
              Aprovados — Aguardando Entrega
              <Badge variant="secondary" className="ml-1">
                {approved.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approved.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {userMap.get(r.user_id) ?? r.user_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.notes
                        ? String(r.notes)
                        : `Resgate #${r.id.slice(0, 8)}`}{" "}
                      &middot; {r.points_spent} pts
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => onDeliver(r.id)}
                  >
                    <IconPackages className="size-3.5" />
                    Marcar Entregue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All redemptions history */}
      {sorted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Historico de Resgates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {sorted.map((r) => {
                const statusInfo = STATUS_CONFIG[r.status ?? "pending"] ?? STATUS_CONFIG.pending;
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className="size-4 shrink-0" style={{ color: statusInfo.color }} />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {userMap.get(r.user_id) ?? r.user_id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.notes ? String(r.notes) : `Resgate #${r.id.slice(0, 8)}`}{" "}
                          &middot; {r.points_spent} pts
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                      className="text-xs shrink-0"
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
