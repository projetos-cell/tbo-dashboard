import { IconGift } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { REWARD_CATEGORIES, type CatalogReward } from "@/features/cultura/data/rewards-catalog";

interface RedeemConfirmDialogProps {
  reward: CatalogReward | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  userBalance: number;
}

export function RedeemConfirmDialog({
  reward,
  onClose,
  onConfirm,
  isPending,
  userBalance,
}: RedeemConfirmDialogProps) {
  return (
    <Dialog open={!!reward} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar Resgate</DialogTitle>
        </DialogHeader>
        {reward && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <IconGift className="size-8 mx-auto text-tbo-orange" />
              <p className="font-medium">{reward.name}</p>
              <p className="text-sm text-muted-foreground">
                {reward.description}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {reward.points} pontos
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{
                    color: REWARD_CATEGORIES[reward.category].color,
                    backgroundColor: REWARD_CATEGORIES[reward.category].bg,
                    borderColor: "transparent",
                  }}
                >
                  {REWARD_CATEGORIES[reward.category].label}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Seu saldo após resgate:{" "}
              <span className="font-semibold">
                {userBalance - reward.points} pts
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={onConfirm}
                disabled={isPending}
              >
                {isPending ? "Resgatando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
