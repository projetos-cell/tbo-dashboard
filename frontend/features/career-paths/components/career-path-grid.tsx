"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { CareerPathCard } from "./career-path-card";
import type { CareerPathWithMemberCount } from "@/features/career-paths/services/career-paths";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

interface CareerPathGridProps {
  paths: CareerPathWithMemberCount[];
  isLoading?: boolean;
}

export function CareerPathGrid({ paths, isLoading }: CareerPathGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!paths.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
      >
        <span className="text-4xl">🗺️</span>
        <h3 className="mt-3 font-semibold">Nenhuma trilha configurada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          As trilhas de carreira ainda não foram definidas.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {paths.map((path) => (
        <motion.div key={path.id} variants={item}>
          <CareerPathCard path={path} />
        </motion.div>
      ))}
    </motion.div>
  );
}
