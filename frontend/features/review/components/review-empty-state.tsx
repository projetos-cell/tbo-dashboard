"use client";

import { IconEye } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ReviewEmptyStateProps {
  onCreateProject: () => void;
}

export function ReviewEmptyState({ onCreateProject }: ReviewEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <IconEye className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Nenhum projeto de review</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Crie seu primeiro projeto para começar a revisar renders com seu time e
        clientes.
      </p>
      <Button onClick={onCreateProject}>Novo Projeto</Button>
    </div>
  );
}
