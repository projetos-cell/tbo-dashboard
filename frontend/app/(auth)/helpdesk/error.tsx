"use client";

import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function HelpdeskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <IconAlertTriangle className="h-10 w-10 text-destructive" />
      <div className="text-center">
        <p className="font-semibold">Erro ao carregar o Helpdesk</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
