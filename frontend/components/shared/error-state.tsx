"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/tbo-ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Ocorreu um erro ao carregar os dados.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <AlertTriangle className="size-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Erro</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RotateCcw className="size-3.5 mr-1.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
