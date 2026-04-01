"use client";

import {
  IconGift,
  IconPlus,
  IconPencil,
  IconTrash,
  IconDots,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RedemptionPendingList } from "./redemption-pending-list";
import { EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type RewardRow = Database["public"]["Tables"]["recognition_rewards"]["Row"];
type RedemptionRow = Database["public"]["Tables"]["recognition_redemptions"]["Row"];

interface RecompensasAdminTabProps {
  rewards: RewardRow[];
  redemptions: RedemptionRow[];
  userMap: Map<string, string>;
  currentUserId?: string;
  onCreateReward: () => void;
  onEditReward: (reward: RewardRow) => void;
  onDeleteReward: (reward: RewardRow) => void;
  onToggleReward: (id: string, active: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeliver: (id: string) => void;
}

export function RecompensasAdminTab({
  rewards,
  redemptions,
  userMap,
  currentUserId,
  onCreateReward,
  onEditReward,
  onDeleteReward,
  onToggleReward,
  onApprove,
  onReject,
  onDeliver,
}: RecompensasAdminTabProps) {
  return (
    <div className="space-y-6">
      {/* Reward catalog management */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">
            Catalogo de Recompensas (Supabase)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{rewards.length} itens</Badge>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCreateReward}>
              <IconPlus className="size-3.5 mr-1" />
              Nova
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rewards.length > 0 ? (
            <div className="space-y-1">
              {rewards.map((reward) => (
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
                        <IconDots className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditReward(reward)}>
                        <IconPencil className="size-3.5 mr-1.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggleReward(reward.id, !reward.active)}
                      >
                        {reward.active ? (
                          <>
                            <IconToggleLeft className="size-3.5 mr-1.5" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <IconToggleRight className="size-3.5 mr-1.5" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => onDeleteReward(reward)}
                      >
                        <IconTrash className="size-3.5 mr-1.5" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={IconGift}
              title="Nenhuma recompensa no catalogo Supabase"
              description="Crie recompensas personalizadas para os colaboradores resgatarem."
              cta={{ label: "Nova recompensa", onClick: onCreateReward }}
            />
          )}
        </CardContent>
      </Card>

      {/* Redemptions management */}
      <RedemptionPendingList
        redemptions={redemptions}
        userMap={userMap}
        onApprove={onApprove}
        onReject={onReject}
        onDeliver={onDeliver}
      />
    </div>
  );
}
