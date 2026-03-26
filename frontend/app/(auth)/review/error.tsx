"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReviewError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
        <IconAlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Erro ao carregar Creative Review</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {error.message || "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
