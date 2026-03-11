"use client";

import Link from "next/link";
import { IconLoader2, IconTargetArrow, IconArrowRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { OKRCard } from "./okr/OKRCard";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

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

  const { data: objectives, isLoading } = useQuery({
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

      {visibleOkrs.length > 0 ? (
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
                className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/30 px-5 py-2 text-sm font-medium transition-colors hover:bg-secondary/50"
              >
                Ver todos os {allOkrs.length} OKRs
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </>
      ) : !isLoading ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/50 bg-secondary/10 p-6">
          <p className="font-medium text-muted-foreground">
            Nenhum OKR atribuído
          </p>
          <p className="text-sm text-muted-foreground/60">
            Seus objetivos e resultados-chave aparecerão aqui.
          </p>
        </div>
      ) : null}
    </div>
  );
}
