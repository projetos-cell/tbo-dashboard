"use client";

import { useState } from "react";
import { Gift, Star, Clock, CheckCircle, Plus, Pencil, Trash2, MoreHorizontal, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RewardsTierCatalog } from "@/features/cultura/components/rewards-tier-catalog";
import { RedeemConfirmDialog } from "@/features/cultura/components/redeem-confirm-dialog";
import { RedemptionPendingList } from "@/features/cultura/components/redemption-pending-list";
import { TierProgress } from "@/features/cultura/components/tier-progress";
import { RewardFormDialog, type RewardFormData } from "@/features/cultura/components/reward-form-dialog";
import { ErrorState, EmptyState, ConfirmDialog } from "@/components/shared";
import {
  useRewardsKPIs,
  useRewards,
  useRedemptions,
  useCreateRedemption,
  useUpdateRedemptionStatus,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from "@/features/cultura/hooks/use-rewards";
import { usePointsBalance } from "@/features/cultura/hooks/use-reconhecimentos";
import { usePeople } from "@/features/people/hooks/use-people";
import { useAuthStore } from "@/stores/auth-store";
import type { CatalogReward } from "@/features/cultura/data/rewards-catalog";
import type { Database } from "@/lib/supabase/types";

type RewardRow = Database["public"]["Tables"]["recognition_rewards"]["Row"];

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
  const [redeemingReward, setRedeemingReward] = useState<CatalogReward | null>(null);

  // Reward catalog admin state
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardRow | null>(null);
  const [deletingReward, setDeletingReward] = useState<RewardRow | null>(null);

  const { data: kpis, isLoading: kpisLoading } = useRewardsKPIs();
  const { data: balance, isLoading } = usePointsBalance(user?.id);
  const { data: myRedemptions } = useRedemptions({ userId: user?.id });
  const { data: allRedemptions } = useRedemptions(canManage ? {} : { userId: user?.id });
  const { data: people } = usePeople();
  const { data: catalogRewards } = useRewards(false); // all rewards for admin

  const createRedemption = useCreateRedemption();
  const updateStatus = useUpdateRedemptionStatus();
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

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
    try {
      await createRedemption.mutateAsync({
        tenant_id: tenantId,
        user_id: user.id,
        reward_id: redeemingReward.id,
        points_spent: redeemingReward.points,
        status: "pending",
        notes: redeemingReward.name,
      } as Database["public"]["Tables"]["recognition_redemptions"]["Insert"]);
      setRedeemingReward(null);
    } catch {
      // handled by mutation onError
    }
  };

  const handleSaveReward = async (data: RewardFormData) => {
    try {
      if (editingReward) {
        await updateReward.mutateAsync({
          id: editingReward.id,
          updates: {
            name: data.name,
            description: data.description,
            points_required: data.points_required,
            type: data.type,
            value_brl: data.value_brl,
            active: data.active,
          },
        });
      } else {
        await createReward.mutateAsync({
          tenant_id: tenantId!,
          name: data.name,
          description: data.description,
          points_required: data.points_required,
          type: data.type,
          value_brl: data.value_brl,
          active: data.active,
          created_by: user?.id,
        } as Database["public"]["Tables"]["recognition_rewards"]["Insert"]);
      }
      setShowRewardForm(false);
      setEditingReward(null);
    } catch {
      // handled by mutation onError
    }
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
        {canManage && tab === "admin" && (
          <Button
            size="sm"
            onClick={() => {
              setEditingReward(null);
              setShowRewardForm(true);
            }}
          >
            <Plus className="size-4 mr-1" />
            Nova recompensa
          </Button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Gift className="size-3.5" />
              Recompensas
            </div>
            {kpisLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-2xl font-bold">{kpis?.activeRewards ?? 0}</p>
                <p className="text-xs text-muted-foreground">ativas</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Star className="size-3.5" />
              Meu saldo
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-2xl font-bold">{userBalance}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="size-3.5" />
              Pendentes
            </div>
            {kpisLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{kpis?.pendingRedemptions ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle className="size-3.5" />
              Total resgates
            </div>
            {kpisLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{kpis?.totalRedemptions ?? 0}</p>
            )}
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
          ) : (
            <EmptyState
              icon={Gift}
              title="Nenhum resgate ainda"
              description="Explore o catalogo e resgate recompensas com seus pontos!"
              cta={{ label: "Ver catalogo", onClick: () => setTab("catalogo") }}
            />
          )}
        </TabsContent>

        {/* Admin tab */}
        {canManage && (
          <TabsContent value="admin" className="mt-3 space-y-6">
            {/* Reward catalog management */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">
                  Catalogo de Recompensas (Supabase)
                </CardTitle>
                <Badge variant="secondary">{catalogRewards?.length ?? 0} itens</Badge>
              </CardHeader>
              <CardContent>
                {(catalogRewards ?? []).length > 0 ? (
                  <div className="space-y-1">
                    {(catalogRewards ?? []).map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate flex items-center gap-2">
                              {reward.name}
                              {!reward.active && (
                                <Badge variant="outline" className="text-[10px] text-gray-400">
                                  Inativa
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {reward.points_required} pts
                              {reward.value_brl != null && (
                                <> &middot; R$ {reward.value_brl.toFixed(2)}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 shrink-0">
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingReward(reward);
                                setShowRewardForm(true);
                              }}
                            >
                              <Pencil className="size-3.5 mr-1.5" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateReward.mutate({
                                  id: reward.id,
                                  updates: { active: !reward.active },
                                })
                              }
                            >
                              {reward.active ? (
                                <>
                                  <ToggleLeft className="size-3.5 mr-1.5" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="size-3.5 mr-1.5" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={() => setDeletingReward(reward)}
                            >
                              <Trash2 className="size-3.5 mr-1.5" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Gift}
                    title="Nenhuma recompensa no catalogo Supabase"
                    description="Crie recompensas personalizadas para os colaboradores resgatarem."
                    cta={{
                      label: "Nova recompensa",
                      onClick: () => {
                        setEditingReward(null);
                        setShowRewardForm(true);
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Redemptions management */}
            <RedemptionPendingList
              redemptions={allRedemptions ?? []}
              userMap={userMap}
              onApprove={(id) =>
                updateStatus.mutate({
                  id,
                  status: "approved",
                  approvedBy: user?.id,
                })
              }
              onReject={(id) =>
                updateStatus.mutate({
                  id,
                  status: "rejected",
                  approvedBy: user?.id,
                })
              }
              onDeliver={(id) =>
                updateStatus.mutate({
                  id,
                  status: "delivered",
                  approvedBy: user?.id,
                })
              }
            />
          </TabsContent>
        )}
      </Tabs>

      <RedeemConfirmDialog
        reward={redeemingReward}
        onClose={() => setRedeemingReward(null)}
        onConfirm={handleRedeem}
        isPending={createRedemption.isPending}
        userBalance={userBalance}
      />

      {/* Reward form dialog */}
      <RewardFormDialog
        open={showRewardForm}
        onOpenChange={setShowRewardForm}
        reward={editingReward}
        onSave={handleSaveReward}
        isSaving={createReward.isPending || updateReward.isPending}
      />

      {/* Delete reward confirmation */}
      <ConfirmDialog
        open={!!deletingReward}
        onOpenChange={(open) => !open && setDeletingReward(null)}
        title={`Excluir "${deletingReward?.name}"?`}
        description="A recompensa sera removida do catalogo. Resgates existentes nao serao afetados."
        confirmLabel="Excluir"
        onConfirm={async () => {
          try {
            if (deletingReward) await deleteReward.mutateAsync(deletingReward.id);
          } catch {
            // handled by mutation onError
          } finally {
            setDeletingReward(null);
          }
        }}
      />
    </div>
  );
}
