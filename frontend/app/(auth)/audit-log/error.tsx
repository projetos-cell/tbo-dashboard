"use client";

import { ErrorState } from "@/components/shared";

export default function AuditLogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      message={error.message || "Erro ao carregar audit log."}
      onRetry={reset}
    />
  );
}
