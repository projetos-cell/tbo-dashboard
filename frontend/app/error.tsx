"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TBO OS Root Error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Erro no TBO OS</h1>
          <p className="text-muted-foreground">{error.message || "Ocorreu um erro inesperado."}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
