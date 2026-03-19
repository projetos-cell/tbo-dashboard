"use client";

import { Button } from "@/components/ui/button";
import { IconAlertCircle } from "@tabler/icons-react";

export default function FiscalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <IconAlertCircle className="size-10 text-destructive" />
      <div>
        <p className="font-semibold">Erro ao carregar o motor fiscal</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
