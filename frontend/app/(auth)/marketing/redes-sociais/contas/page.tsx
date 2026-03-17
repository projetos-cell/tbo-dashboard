"use client";

import {
  IconPlus,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandX,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useRsmAccounts } from "@/features/marketing/hooks/use-marketing-social";

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

function ContasContent() {
  const { data: accounts, isLoading, error, refetch } = useRsmAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas Conectadas</h1>
          <p className="text-sm text-muted-foreground">Gerencie as contas de redes sociais.</p>
        </div>
        <Button>
          <IconPlus className="mr-1 h-4 w-4" /> Conectar Conta
        </Button>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar contas." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState icon={IconUsers} title="Nenhuma conta conectada" description="Conecte suas redes sociais para comecar a gerenciar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const PlatformIcon = PLATFORM_ICONS[account.platform] ?? IconUsers;
            const color = PLATFORM_COLORS[account.platform] ?? "#6b7280";
            return (
              <Card key={account.id} className="cursor-pointer hover:border-pink-400/40 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5" style={{ backgroundColor: `${color}15` }}>
                      <PlatformIcon className="size-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">@{account.handle}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                    </div>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{(account.followers_count ?? 0).toLocaleString("pt-BR")} seguidores</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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
