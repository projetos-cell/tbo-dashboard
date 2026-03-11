"use client";

import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface WishlistItem {
  id: string;
  name: string;
  cost: number;
  category: string;
}

interface WishlistCardProps {
  items: WishlistItem[];
  currentPoints: number;
}

const DEFAULT_ITEMS: WishlistItem[] = [
  { id: "1", name: "Livro de Design", cost: 500, category: "product" },
  { id: "2", name: "Day Off", cost: 2000, category: "benefit" },
  { id: "3", name: "Gift Card R$50", cost: 1500, category: "product" },
  { id: "4", name: "Mentoria 1h", cost: 800, category: "experience" },
];

export function WishlistCard({ items, currentPoints }: WishlistCardProps) {
  const data = items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">
        Resgatar
      </h4>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {data.map((item) => {
            const canRedeem = currentPoints >= item.cost;
            const progress = Math.min(
              (currentPoints / item.cost) * 100,
              100
            );

            return (
              <div
                key={item.id}
                className="flex min-w-[160px] shrink-0 flex-col rounded-xl border border-border/30 bg-secondary/30 p-4"
              >
                <span className="mb-2 text-sm font-medium">{item.name}</span>
                <span className="mb-2 text-xs text-muted-foreground">
                  {item.cost.toLocaleString("pt-BR")} pts
                </span>
                <Progress value={progress} className="mb-3 h-1" />
                <button
                  disabled={!canRedeem}
                  className="mt-auto rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 disabled:hover:bg-primary/10"
                >
                  Resgatar
                </button>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
