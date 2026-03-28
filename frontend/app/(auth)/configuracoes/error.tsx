"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ConfiguracoesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error tracking service in production
    console.error("[configuracoes] error boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <IconAlertTriangle size={40} className="text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erro ao carregar configurações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou entre em contato com o suporte.
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Tentar novamente
      </Button>
    </div>
  );
}
