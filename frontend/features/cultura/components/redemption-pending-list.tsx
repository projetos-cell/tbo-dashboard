import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export function RedemptionPendingList({
  redemptions,
  userMap,
  onApprove,
  onReject,
}: RedemptionPendingListProps) {
  const pending = redemptions.filter((r) => r.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Resgates Pendentes
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
          <p className="text-sm text-muted-foreground">
            Nenhum resgate pendente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
