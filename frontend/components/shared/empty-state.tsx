"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  cta?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  children?: React.ReactNode;
  /** Compact mode for inline contexts (less padding) */
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, cta, children, compact }: EmptyStateProps) {
  return (
    <div className={compact ? "flex flex-col items-center justify-center px-4 py-8 text-center" : "flex flex-col items-center justify-center px-4 py-16 text-center"}>
      {Icon && (
        <div className="mb-4 rounded-2xl bg-muted/60 p-5">
          <Icon className="size-10 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="mb-1.5 text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {cta && (
        <Button onClick={cta.onClick} size="sm" className="gap-1.5">
          {cta.icon ? <cta.icon className="size-4" /> : <IconPlus className="size-4" />}
          {cta.label}
        </Button>
      )}
      {children}
    </div>
  );
}
