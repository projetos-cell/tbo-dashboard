"use client";

import { IconHammer, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateBuilderPlaceholderProps {
  onCreateTemplate?: () => void;
}

/**
 * Placeholder for the custom template builder.
 * Shows existing static templates count and a CTA to create custom ones.
 * Will be replaced with full builder UI in a future cycle.
 */
export function TemplateBuilderPlaceholder({ onCreateTemplate }: TemplateBuilderPlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-xl bg-primary/5 p-3 mb-4">
          <IconHammer className="size-8 text-primary/60" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold">Template Builder</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Crie templates personalizados com secoes e tarefas pre-definidas.
          Em desenvolvimento.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          disabled
          onClick={onCreateTemplate}
        >
          <IconPlus className="size-3.5 mr-1.5" />
          Criar Template Custom
        </Button>
      </CardContent>
    </Card>
  );
}
