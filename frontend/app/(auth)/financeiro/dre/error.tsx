"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function DREError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // logger.error("DRE page error", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950">
        <IconAlertTriangle className="size-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Erro ao carregar o DRE</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Ocorreu um problema ao carregar os dados da Demonstração de Resultados. Tente novamente.
        </p>
        {error.message && (
          <p className="text-xs text-muted-foreground/60 mt-2 font-mono">{error.message}</p>
        )}
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        Tentar novamente
      </Button>
    </div>
  );
}
