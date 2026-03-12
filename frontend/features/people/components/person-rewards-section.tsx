"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecognitionsForUser,
  usePointsBalance,
} from "@/features/cultura/hooks/use-reconhecimentos";

// ── Component ────────────────────────────────────────────────────────────────

interface PersonRewardsSectionProps {
  personId: string;
}

export function PersonRewardsSection({ personId }: PersonRewardsSectionProps) {
  const { data: recognitions, isLoading: loadingRec } =
    useRecognitionsForUser(personId);
  const { data: balance, isLoading: loadingBal } = usePointsBalance(personId);

  const isLoading = loadingRec || loadingBal;
  const recent = recognitions?.slice(0, 3) ?? [];
  const hasAny = recognitions && recognitions.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Reconhecimentos
      </p>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      )}

      {!isLoading && !hasAny && (
        <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500">Nenhum reconhecimento recebido.</p>
        </div>
      )}

      {!isLoading && hasAny && (
        <>
          {/* Points balance grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Ganhos",
                value: balance?.earned ?? 0,
                className: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Usados",
                value: balance?.spent ?? 0,
                className: "text-gray-500",
              },
              {
                label: "Saldo",
                value: balance?.balance ?? 0,
                className: "text-blue-600 dark:text-blue-400 font-semibold",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-center"
              >
                <p className={`text-base font-bold leading-none ${item.className}`}>
                  {item.value}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Recent recognitions */}
          <div className="space-y-1.5">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-3 py-2.5"
              >
                <span className="mt-0.5 text-base leading-none" aria-hidden>
                  {r.value_emoji ?? "⭐"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {r.value_name ?? "Reconhecimento"}
                  </p>
                  {r.message && (
                    <p className="line-clamp-1 text-[11px] text-gray-500">
                      {r.message}
                    </p>
                  )}
                </div>
                {r.created_at && (
                  <span className="shrink-0 text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(r.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Link to full history */}
          <Link
            href={`/cultura/reconhecimentos?user=${personId}`}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Star className="h-3 w-3" />
            Ver todos os reconhecimentos
            {recognitions && recognitions.length > 3 && (
              <span className="ml-0.5 text-gray-400">
                ({recognitions.length})
              </span>
            )}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </div>
  );
}
