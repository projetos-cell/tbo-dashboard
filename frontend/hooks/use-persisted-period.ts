"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type {
  PeriodValue,
  PeriodPreset,
} from "@/features/founder-dashboard/components/period-filter";

const VALID_PRESETS: PeriodPreset[] = ["mtd", "last3m", "semester", "ytd", "custom"];
const DEFAULT_PERIOD: PeriodValue = { preset: "ytd" };

/**
 * Persist PeriodValue in URL search params.
 * Encodes as ?period=ytd or ?period=custom&from=2024-01-01&to=2024-06-30
 */
export function usePersistedPeriod(
  defaultPreset: PeriodPreset = "ytd",
): [PeriodValue, (v: PeriodValue) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<PeriodValue>(() => {
    const preset = searchParams.get("period") as PeriodPreset | null;
    if (!preset || !VALID_PRESETS.includes(preset)) {
      return { preset: defaultPreset };
    }
    if (preset === "custom") {
      const from = searchParams.get("from") ?? undefined;
      const to = searchParams.get("to") ?? undefined;
      if (from && to) return { preset: "custom", from, to };
      return { preset: defaultPreset };
    }
    return { preset };
  }, [searchParams, defaultPreset]);

  const setValue = useCallback(
    (newValue: PeriodValue) => {
      const params = new URLSearchParams(searchParams.toString());
      // Clean old period params
      params.delete("period");
      params.delete("from");
      params.delete("to");

      if (newValue.preset !== defaultPreset) {
        params.set("period", newValue.preset);
        if (newValue.preset === "custom" && newValue.from && newValue.to) {
          params.set("from", newValue.from);
          params.set("to", newValue.to);
        }
      }

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, defaultPreset],
  );

  return [value, setValue];
}
