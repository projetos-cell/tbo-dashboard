"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DemandPropertySectionProps {
  title: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: React.ReactNode;
}

export function DemandPropertySection({
  title,
  defaultOpen = true,
  collapsible = true,
  children,
}: DemandPropertySectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {title}
        </p>
        {children}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 w-full group/trigger hover:bg-muted/30 rounded px-1 -mx-1 py-0.5">
        <ChevronRight
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-90",
          )}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
