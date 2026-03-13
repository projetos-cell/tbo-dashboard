"use client";

import { IconPrinter } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`no-print ${className ?? ""}`}
      onClick={() => window.print()}
    >
      <IconPrinter className="h-3.5 w-3.5 mr-1.5" />
      Exportar PDF
    </Button>
  );
}
