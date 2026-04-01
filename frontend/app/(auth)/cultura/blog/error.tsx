"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ModuleError({
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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="rounded-full bg-destructive/10 p-3">
            <IconAlertTriangle className="size-6 text-destructive" />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "Ocorreu um erro inesperado. Tente novamente."}
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-muted-foreground">
                Codigo: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            <IconRefresh className="mr-1.5 size-3.5" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
