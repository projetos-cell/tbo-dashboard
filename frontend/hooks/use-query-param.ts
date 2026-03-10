"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Persist a single value in the URL search params.
 * Survives refresh, back/forward, and is shareable via URL.
 */
export function useQueryParam(
  key: string,
  defaultValue: string,
): [string, (v: string) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (newValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, key, defaultValue],
  );

  return [value, setValue];
}

/**
 * Persist a numeric value (like days selector) in URL search params.
 */
export function useQueryParamNumber<T extends number>(
  key: string,
  defaultValue: T,
  allowedValues?: readonly T[],
): [T, (v: T) => void] {
  const [raw, setRaw] = useQueryParam(key, String(defaultValue));

  const value = useMemo(() => {
    const n = Number(raw) as T;
    if (allowedValues && !allowedValues.includes(n)) return defaultValue;
    if (isNaN(n)) return defaultValue;
    return n;
  }, [raw, defaultValue, allowedValues]);

  const setValue = useCallback(
    (v: T) => setRaw(String(v)),
    [setRaw],
  );

  return [value, setValue];
}
