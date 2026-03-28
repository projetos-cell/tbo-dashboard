"use client";

import { useState } from "react";
import { IconGift, IconStar, IconClock, IconCircleCheck } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsTierCatalog } from "@/features/cultura/components/rewards-tier-catalog";
import { RedeemConfirmDialog } from "@/features/cultura/components/redeem-confirm-dialog";
import { TierProgress } from "@/features/cultura/components/tier-progress";
import { RewardFormDialog, type RewardFormData } from "@/features/cultura/components/reward-form-dialog";
import { RecompensasMeusResgates } from "@/features/cultura/components/recompensas-meus-resgates";
import { RecompensasAdminTab } from "@/features/cultura/components/recompensas-admin-tab";
import { ErrorState, ConfirmDialog } from "@/components/shared";
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

export default function RecompensasPage() {
  const { user, tenantId, role } = useAuthStore();
  const canManage = role === "admin";
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
  const { data: catalogRewards } = useRewards(false);

  const createRedemption = useCreateRedemption();
  const updateStatus = useUpdateRedemptionStatus();
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

  const peopleList = people?.data ?? people ?? [];
  const userMap = new Map(
    (
      peopleList as { id: string; full_name?: string | null; email?: string | null }[]
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
            Nova recompensa
          </Button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <IconGift className="size-3.5" />
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
              <IconStar className="size-3.5" />
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
              <IconClock className="size-3.5" />
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
              <IconCircleCheck className="size-3.5" />
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
            <RewardsTierCatalog userBalance={userBalance} onRedeem={setRedeemingReward} />
          )}
        </TabsContent>

        <TabsContent value="meus" className="mt-3">
          <RecompensasMeusResgates
            redemptions={myRedemptions ?? []}
            onGoToCatalog={() => setTab("catalogo")}
          />
        </TabsContent>

        {canManage && (
          <TabsContent value="admin" className="mt-3">
            <RecompensasAdminTab
              rewards={catalogRewards ?? []}
              redemptions={allRedemptions ?? []}
              userMap={userMap}
              currentUserId={user?.id}
              onCreateReward={() => {
                setEditingReward(null);
                setShowRewardForm(true);
              }}
              onEditReward={(reward) => {
                setEditingReward(reward);
                setShowRewardForm(true);
              }}
              onDeleteReward={setDeletingReward}
              onToggleReward={(id, active) =>
                updateReward.mutate({ id, updates: { active } })
              }
              onApprove={(id) =>
                updateStatus.mutate({ id, status: "approved", approvedBy: user?.id })
              }
              onReject={(id) =>
                updateStatus.mutate({ id, status: "rejected", approvedBy: user?.id })
              }
              onDeliver={(id) =>
                updateStatus.mutate({ id, status: "delivered", approvedBy: user?.id })
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

      <RewardFormDialog
        open={showRewardForm}
        onOpenChange={setShowRewardForm}
        reward={editingReward}
        onSave={handleSaveReward}
        isSaving={createReward.isPending || updateReward.isPending}
      />

      <ConfirmDialog
        open={!!deletingReward}
        onOpenChange={(open) => !open && setDeletingReward(null)}
        title={`Excluir "${deletingReward?.name}"?`}
        description="A recompensa será removida do catálogo. Resgates existentes não serão afetados."
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
