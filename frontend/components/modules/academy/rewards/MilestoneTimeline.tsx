"use client";

const MILESTONES = [100, 500, 1000, 2500, 5000];

interface MilestoneTimelineProps {
  currentPoints: number;
}

export function MilestoneTimeline({ currentPoints }: MilestoneTimelineProps) {
  const maxMilestone = MILESTONES[MILESTONES.length - 1];
  const progress = Math.min((currentPoints / maxMilestone) * 100, 100);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Milestones
      </h4>

      {/* Desktop: horizontal */}
      <div className="hidden sm:block">
        <div className="relative h-2 w-full rounded-full bg-secondary/40">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {MILESTONES.map((m) => {
            const reached = currentPoints >= m;
            return (
              <div key={m} className="flex flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    reached
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                />
                <span
                  className={`mt-1 text-[10px] ${
                    reached ? "font-semibold text-primary" : "text-muted-foreground"
                  }`}
                >
                  {m.toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-2 sm:hidden">
        {MILESTONES.map((m) => {
          const reached = currentPoints >= m;
          return (
            <div key={m} className="flex items-center gap-3">
              <div
                className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                  reached
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                }`}
              />
              <span
                className={`text-sm ${
                  reached ? "font-semibold text-primary" : "text-muted-foreground"
                }`}
              >
                {m.toLocaleString("pt-BR")} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
