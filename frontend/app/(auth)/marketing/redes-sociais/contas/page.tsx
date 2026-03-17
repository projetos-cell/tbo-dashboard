"use client";

// Features #41 #42 #43 — Contas: grid com métricas + modal editar/criar + toggle ativo/inativo

import { useState } from "react";
import {
  IconPlus,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandX,
  IconUsers,
  IconPencil,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useRsmAccounts,
  useUpdateRsmAccount,
} from "@/features/marketing/hooks/use-marketing-social";
import { SocialAccountFormModal } from "@/features/marketing/components/social/social-account-form-modal";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  linkedin: IconBrandLinkedin,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  twitter: IconBrandX,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#000000",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
};

interface AccountRow {
  id: string;
  platform: string;
  handle: string;
  profile_url: string | null;
  followers_count: number | null;
  is_active: boolean | null;
}

function ContasContent() {
  const { data: accounts, isLoading, error, refetch } = useRsmAccounts();
  const updateMutation = useUpdateRsmAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(a: AccountRow) {
    setEditing(a);
    setModalOpen(true);
  }

  function handleToggle(a: AccountRow) {
    updateMutation.mutate({ id: a.id, updates: { is_active: !a.is_active } });
  }

  const active = (accounts ?? []).filter((a) => a.is_active !== false).length;
  const totalFollowers = (accounts ?? []).reduce(
    (s, a) => s + (a.followers_count ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas Conectadas</h1>
          <p className="text-sm text-muted-foreground">
            {!isLoading && accounts
              ? `${active} ativa${active !== 1 ? "s" : ""} · ${totalFollowers.toLocaleString("pt-BR")} seguidores`
              : "Gerencie as contas de redes sociais."}
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="mr-1 h-4 w-4" /> Conectar Conta
        </Button>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar contas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="Nenhuma conta conectada"
          description="Conecte suas redes sociais para começar a gerenciar."
          cta={{ label: "Conectar Conta", onClick: openAdd, icon: IconPlus }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(accounts as unknown as AccountRow[]).map((account) => {
            const PlatformIcon = PLATFORM_ICONS[account.platform] ?? IconUsers;
            const color = PLATFORM_COLORS[account.platform] ?? "#6b7280";
            const isActive = account.is_active !== false;
            return (
              <Card
                key={account.id}
                className={`transition-colors ${isActive ? "hover:border-pink-400/40" : "opacity-60"}`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="rounded-lg p-2.5 shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <PlatformIcon className="size-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">@{account.handle}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {account.platform}
                      </p>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"} className="shrink-0">
                      {isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  <div className="text-sm font-medium text-muted-foreground">
                    {(account.followers_count ?? 0).toLocaleString("pt-BR")} seguidores
                  </div>

                  {/* #43 — Toggle ativo/inativo + editar */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggle(account)}
                        disabled={updateMutation.isPending}
                        aria-label="Ativar / desativar conta"
                      />
                      <span className="text-xs text-muted-foreground">
                        {isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(account)}
                      aria-label="Editar conta"
                    >
                      <IconPencil className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SocialAccountFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        account={editing}
      />
    </div>
  );
}

export default function ContasPage() {
  return (
    <RequireRole module="marketing">
      <ContasContent />
    </RequireRole>
  );
}
