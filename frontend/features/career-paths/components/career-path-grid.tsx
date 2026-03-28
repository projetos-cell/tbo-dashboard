"use client";

import { CareerPathCard } from "./career-path-card";
import type { CareerPathWithMemberCount } from "@/features/career-paths/services/career-paths";

interface CareerPathGridProps {
  paths: CareerPathWithMemberCount[];
  isLoading?: boolean;
}

export function CareerPathGrid({ paths, isLoading }: CareerPathGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border bg-gray-100/60" />
        ))}
      </div>
    );
  }

  if (!paths.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <span className="text-4xl">🗺️</span>
        <h3 className="mt-3 font-semibold">Nenhuma trilha configurada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          As trilhas de carreira ainda não foram definidas para este tenant.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path) => (
        <CareerPathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
