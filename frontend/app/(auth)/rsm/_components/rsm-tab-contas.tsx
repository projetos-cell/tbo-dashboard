"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChartBar } from "@tabler/icons-react";
import { EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type RsmAccountRow = Database["public"]["Tables"]["rsm_accounts"]["Row"];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-800",
  facebook: "bg-blue-100 text-blue-800",
  linkedin: "bg-sky-100 text-sky-800",
  tiktok: "bg-slate-100 text-slate-800",
  youtube: "bg-red-100 text-red-800",
  twitter: "bg-cyan-100 text-cyan-800",
  x: "bg-slate-100 text-slate-800",
};

interface RsmTabContasProps {
  accounts: RsmAccountRow[];
  isLoading: boolean;
}

export function RsmTabContas({ accounts, isLoading }: RsmTabContasProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={IconChartBar}
        title="Nenhuma conta cadastrada"
        description="Adicione contas de redes sociais para gerenciar sua presença digital."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className="cursor-pointer transition-shadow hover:shadow-md hover:ring-1 hover:ring-border"
          onClick={() => router.push(`/rsm/${account.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className={
                  PLATFORM_COLORS[account.platform.toLowerCase()] ??
                  "bg-gray-100 text-gray-800"
                }
              >
                {account.platform}
              </Badge>
              <Badge variant={account.is_active ? "default" : "outline"}>
                {account.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <CardTitle className="text-base">@{account.handle}</CardTitle>
            <CardDescription>
              {account.profile_url ?? "Sem URL de perfil"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {(account.followers_count ?? 0).toLocaleString("pt-BR")}
              </span>{" "}
              seguidores
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
