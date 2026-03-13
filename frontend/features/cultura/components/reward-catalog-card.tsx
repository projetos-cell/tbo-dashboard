"use client";

import { IconGift, IconStar, IconEdit, IconTrash, IconDots } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REWARD_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type RewardRow = Database["public"]["Tables"]["recognition_rewards"]["Row"];

interface RewardCatalogCardProps {
  reward: RewardRow;
  userBalance?: number;
  onRedeem?: (reward: RewardRow) => void;
  onEdit?: (reward: RewardRow) => void;
  onDelete?: (reward: RewardRow) => void;
  canManage?: boolean;
}

export function RewardCatalogCard({
  reward,
  userBalance = 0,
  onRedeem,
  onEdit,
  onDelete,
  canManage,
}: RewardCatalogCardProps) {
  const typeInfo =
    REWARD_TYPES[reward.type as keyof typeof REWARD_TYPES] ?? REWARD_TYPES.experiencia;
  const canAfford = userBalance >= (reward.points_required ?? 0);

  return (
    <Card className="relative overflow-hidden">
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: typeInfo.color }}
      />
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <IconGift className="size-4 shrink-0" style={{ color: typeInfo.color }} />
              <h3 className="font-medium text-sm truncate">{reward.name}</h3>
            </div>

            {reward.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {reward.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {typeInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs font-semibold"
                style={{ color: "#f59e0b" }}
              >
                <IconStar className="size-3 mr-0.5" />
                {reward.points_required} pts
              </Badge>
              {reward.value_brl && (
                <Badge variant="outline" className="text-xs">
                  R$ {Number(reward.value_brl).toFixed(0)}
                </Badge>
              )}
              {!reward.active && (
                <Badge variant="destructive" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <IconDots className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(reward)}>
                  <IconEdit className="size-3.5 mr-1.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => onDelete?.(reward)}
                >
                  <IconTrash className="size-3.5 mr-1.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Redeem button */}
        {onRedeem && (
          <Button
            size="sm"
            variant={canAfford ? "default" : "outline"}
            className="w-full mt-3"
            disabled={!canAfford}
            onClick={() => onRedeem(reward)}
          >
            {canAfford ? "Resgatar" : `Faltam ${(reward.points_required ?? 0) - userBalance} pts`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
