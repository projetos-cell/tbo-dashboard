"use client";

import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type Step = "Nome" | "Tipo" | "Opções" | "Obrigatório?" | "Confirmar";
const STEPS = ["Nome", "Tipo", "Opções", "Obrigatório?", "Confirmar"] as const;

export function StepIndicator({
  steps,
  currentStep,
  needsOptions,
}: {
  steps: readonly Step[];
  currentStep: number;
  needsOptions: boolean;
}) {
  const visibleSteps = needsOptions ? steps : steps.filter((s) => s !== "Opções");

  return (
    <div className="flex items-center gap-1.5 mb-2">
      {visibleSteps.map((s, i) => {
        const realIdx = steps.indexOf(s);
        const isActive = realIdx === currentStep;
        const isPast =
          realIdx < currentStep ||
          (s === "Opções" && currentStep > 2 && !needsOptions);

        return (
          <div key={s} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className={cn(
                  "h-px flex-1 w-4 transition-colors",
                  isPast ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div
              className={cn(
                "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isPast
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isPast ? <IconCheck className="h-3 w-3" /> : i + 1}
            </div>
          </div>
        );
      })}
      <span className="text-xs text-muted-foreground ml-1">
        {steps[currentStep]}
      </span>
    </div>
  );
}

export { STEPS };
export type { Step };
