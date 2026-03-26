"use client";

import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

export default function ReviewProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Erro ao carregar projeto</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "Ocorreu um erro inesperado. Tente novamente."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        <IconRefresh className="mr-1.5 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
