"use client";

import type { ReactNode } from "react";

interface AcademyLayoutProps {
  children: ReactNode;
}

export function AcademyLayout({ children }: AcademyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-12 pb-16">{children}</div>
    </div>
  );
}
