"use client";

import { useState } from "react";
import { Gift, Star, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RewardsTierCatalog } from "@/features/cultura/components/rewards-tier-catalog";
import { TierProgress } from "@/features/cultura/components/tier-progress";
import { ErrorState } from "@/components/shared";
import {
  useRewardsKPIs,
  useRedemptions,
  useCreateRedemption,
  useUpdateRedemptionStatus,
} from "@/features/cultura/hooks/use-rewards";
import { usePointsBalance } from "@/features/cultura/hooks/use-reconhecimentos";
import { usePeople } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import { REWARD_CATEGORIES, type CatalogReward } from "@/features/cultura/data/rewards-catalog";
import type { Database } from "@/lib/supabase/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#f59e0b" },
  approved: { label: "Aprovado", color: "#22c55e" },
  rejected: { label: "Rejeitado", color: "#ef4444" },
  delivered: { label: "Entregue", color: "#3b82f6" },
};

export default function RecompensasPage() {
  const { user, tenantId, role } = useAuthStore();
  const canManage = role === "founder" || role === "diretoria";
  const [tab, setTab] = useState("catalogo");
  const [redeemingReward, setRedeemingReward] = useState<CatalogReward | null>(
    null
  );

  const { data: kpis } = useRewardsKPIs();
  const { data: balance, isLoading } = usePointsBalance(user?.id);
  const { data: myRedemptions } = useRedemptions({ userId: user?.id });
  const { data: allRedemptions } = useRedemptions(
    canManage ? {} : { userId: user?.id }
  );
  const { data: people } = usePeople();

  const createRedemption = useCreateRedemption();
  const updateStatus = useUpdateRedemptionStatus();

  const peopleList = people?.data ?? people ?? [];
  const userMap = new Map(
    (
      peopleList as {
        id: string;
        full_name?: string | null;
        email?: string | null;
      }[]
    ).map((p) => [p.id, p.full_name ?? p.email ?? p.id])
  );

  const handleRedeem = async () => {
    if (!redeemingReward || !user || !tenantId) return;
    await createRedemption.mutateAsync({
      tenant_id: tenantId,
      user_id: user.id,
      reward_id: redeemingReward.id,
      points_spent: redeemingReward.points,
      status: "pending",
      notes: redeemingReward.name,
    } as Database["public"]["Tables"]["recognition_redemptions"]["Insert"]);
    setRedeemingReward(null);
  };

  const userBalance = balance?.balance ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">TBO Rewards</h1>
          <p className="text-sm text-muted-foreground">
            Resgate recompensas com seus pontos de reconhecimento.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Gift className="size-3.5" />
              Recompensas
            </div>
            <p className="text-2xl font-bold">{kpis?.activeRewards ?? 0}</p>
            <p className="text-xs text-muted-foreground">ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Star className="size-3.5" />
              Meu saldo
            </div>
            <p className="text-2xl font-bold">{userBalance}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="size-3.5" />
              Pendentes
            </div>
            <p className="text-2xl font-bold">
              {kpis?.pendingRedemptions ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle className="size-3.5" />
              Total resgates
            </div>
            <p className="text-2xl font-bold">
              {kpis?.totalRedemptions ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier progress */}
      {balance && (
        <Card>
          <CardContent className="p-4">
            <TierProgress points={balance.earned} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="meus">Meus Resgates</TabsTrigger>
          {canManage && <TabsTrigger value="admin">Gerenciar</TabsTrigger>}
        </TabsList>

        {/* Catalog tab — tiered rewards */}
        <TabsContent value="catalogo" className="mt-4">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-16 rounded-lg" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-44" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RewardsTierCatalog
              userBalance={userBalance}
              onRedeem={setRedeemingReward}
            />
          )}
        </TabsContent>

        {/* My redemptions tab */}
        <TabsContent value="meus" className="mt-3">
          {(myRedemptions ?? []).length > 0 ? (
            <div className="space-y-2">
              {(myRedemptions ?? []).map((r) => {
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
                              {new Date(r.created_at).toLocaleDateString(
                                "pt-BR"
                              )}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Você ainda não fez nenhum resgate.
            </div>
          )}
        </TabsContent>

        {/* Admin tab */}
        {canManage && (
          <TabsContent value="admin" className="mt-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Resgates Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(allRedemptions ?? []).filter((r) => r.status === "pending")
                  .length > 0 ? (
                  <div className="space-y-2">
                    {(allRedemptions ?? [])
                      .filter((r) => r.status === "pending")
                      .map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">
                              {userMap.get(r.user_id) ??
                                r.user_id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(r as Record<string, unknown>).notes
                                ? String((r as Record<string, unknown>).notes)
                                : `Resgate #${r.id.slice(0, 8)}`}{" "}
                              &middot; {r.points_spent} pts &middot;{" "}
                              {r.created_at &&
                                new Date(r.created_at).toLocaleDateString(
                                  "pt-BR"
                                )}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: r.id,
                                  status: "approved",
                                  approvedBy: user?.id,
                                })
                              }
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: r.id,
                                  status: "rejected",
                                  approvedBy: user?.id,
                                })
                              }
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
          </TabsContent>
        )}
      </Tabs>

      {/* Redeem confirmation dialog */}
      <Dialog
        open={!!redeemingReward}
        onOpenChange={() => setRedeemingReward(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
          </DialogHeader>
          {redeemingReward && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <Gift className="size-8 mx-auto text-tbo-orange" />
                <p className="font-medium">{redeemingReward.name}</p>
                <p className="text-sm text-muted-foreground">
                  {redeemingReward.description}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {redeemingReward.points} pontos
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      color:
                        REWARD_CATEGORIES[redeemingReward.category].color,
                      backgroundColor:
                        REWARD_CATEGORIES[redeemingReward.category].bg,
                      borderColor: "transparent",
                    }}
                  >
                    {REWARD_CATEGORIES[redeemingReward.category].label}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-center text-muted-foreground">
                Seu saldo após resgate:{" "}
                <span className="font-semibold">
                  {userBalance - redeemingReward.points} pts
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRedeemingReward(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRedeem}
                  disabled={createRedemption.isPending}
                >
                  {createRedemption.isPending
                    ? "Resgatando..."
                    : "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
