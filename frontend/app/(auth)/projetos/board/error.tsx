"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjetosBoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TBO OS Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="rounded-full bg-red-500/10 p-3">
            <IconAlertTriangle className="size-6 text-red-500" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold">Algo deu errado</h2>
            <p className="text-sm text-gray-500">
              {error.message || "Ocorreu um erro inesperado. Tente novamente."}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 font-mono">
                Codigo: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            <IconRefresh className="size-3.5 mr-1.5" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
