"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Ocorreu um erro ao carregar os dados.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-500/10 p-4">
        <IconAlertTriangle className="size-8 text-red-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">Erro</h3>
      <p className="mb-4 max-w-sm text-sm text-gray-500">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <IconRefresh className="mr-1.5 size-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
