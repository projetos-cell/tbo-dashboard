"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader2 } from "@tabler/icons-react";
import {
  useInstagramConfig,
  useSaveInstagramConfig,
} from "@/hooks/use-instagram-sync";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstagramConfigDialog({ open, onOpenChange }: Props) {
  const { data: existing } = useInstagramConfig();
  const saveMutation = useSaveInstagramConfig();

  const [accessToken, setAccessToken] = useState("");
  const [igUserId, setIgUserId] = useState("");

  // Populate fields when dialog opens with existing config
  const handleOpenChange = (next: boolean) => {
    if (next && existing) {
      setAccessToken(existing.access_token ?? "");
      setIgUserId(existing.ig_user_id ?? "");
    }
    onOpenChange(next);
  };

  const handleSave = () => {
    saveMutation.mutate(
      {
        access_token: accessToken.trim(),
        ig_user_id: igUserId.trim(),
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const isValid = accessToken.trim().length > 20 && igUserId.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Instagram</DialogTitle>
          <DialogDescription>
            Cole o token de acesso (long-lived) e o ID do usuario Instagram.
            Obtenha ambos no{" "}
            <a
              href="https://developers.facebook.com/tools/explorer/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Graph API Explorer
            </a>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ig-token">Access Token</Label>
            <Input
              id="ig-token"
              type="password"
              placeholder="EAAxxxxxxx..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Token long-lived (60 dias). Sera renovado automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ig-user-id">Instagram User ID</Label>
            <Input
              id="ig-user-id"
              placeholder="17841400..."
              value={igUserId}
              onChange={(e) => setIgUserId(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              ID numerico da conta profissional/business do Instagram.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || saveMutation.isPending}
          >
            {saveMutation.isPending && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
