"use client";

import Link from "next/link";
import {
  IconLoader2,
  IconTargetArrow,
  IconArrowRight,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { OKRCard } from "./okr/OKRCard";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_VISIBLE = 2;

interface KRRow {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
}

interface ObjRow {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  owner_id?: string;
  status?: string;
  progress?: number;
  deadline?: string;
  end_date?: string;
  okr_key_results?: KRRow[];
}

export function OKRProgressSection() {
  const userId = useAuthStore((s) => s.user?.id);
  const user = useAuthStore((s) => s.user);

  const { data: objectives, isLoading, isError, refetch } = useQuery({
    queryKey: ["academy-okrs", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("okr_objectives" as never)
        .select("*, okr_key_results(*)" as never)
        .eq("owner_id" as never, userId as never)
        .order("created_at" as never);
      if (error) throw error;
      return (data ?? []) as unknown as ObjRow[];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });

  const ownerName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "Você";

  const allOkrs = (objectives ?? []).map((obj) => ({
    id: obj.id,
    objective: obj.title ?? obj.name ?? obj.description ?? "",
    ownerName,
    deadline: obj.deadline ?? obj.end_date ?? "",
    keyResults: (obj.okr_key_results ?? []).map((kr) => ({
      id: kr.id,
      description: kr.title ?? kr.name ?? kr.description ?? "",
      currentValue: kr.current_value ?? 0,
      targetValue: kr.target_value ?? 100,
      unit: kr.unit ?? "%",
    })),
  }));

  const visibleOkrs = allOkrs.slice(0, MAX_VISIBLE);
  const hasMore = allOkrs.length > MAX_VISIBLE;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconTargetArrow className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Meus OKRs</h2>
        {isLoading && (
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <IconAlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar OKRs
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <IconRefresh className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border/30 bg-secondary/20 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-10" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleOkrs.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleOkrs.map((okr) => (
              <OKRCard
                key={okr.id}
                objectiveId={okr.id}
                objective={okr.objective}
                ownerName={okr.ownerName}
                deadline={okr.deadline}
                keyResults={okr.keyResults}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <Link
                href="/okrs/individuais"
                className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/30 px-5 py-2 text-sm font-medium transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                Ver todos os {allOkrs.length} OKRs
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 bg-secondary/10 p-6">
          <p className="font-medium text-muted-foreground">
            Nenhum OKR atribuído
          </p>
          <p className="text-sm text-muted-foreground/60">
            Seus objetivos e resultados-chave aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
