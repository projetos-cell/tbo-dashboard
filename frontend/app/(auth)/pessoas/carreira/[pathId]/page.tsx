"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CareerLadder } from "@/features/career-paths/components/career-ladder";
import { useCareerPath, usePathMembers } from "@/features/career-paths/hooks/use-career-paths";
import type { PathMember } from "@/features/career-paths/services/career-paths";

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
} as const;

interface PageProps {
  params: Promise<{ pathId: string }>;
}

export default function CarreiraPathPage({ params }: PageProps) {
  const { pathId } = use(params);
  const { data: careerPath, isLoading, isError, refetch } = useCareerPath(pathId);
  const { data: members, isLoading: membersLoading } = usePathMembers(pathId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-40" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Content skeleton: ladder + members */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-4 w-28" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center"
      >
        <AlertCircle className="h-8 w-8 text-red-500" />
        <h3 className="mt-3 font-semibold text-red-800">Erro ao carregar trilha</h3>
        <p className="mt-1 text-sm text-red-600">
          Não foi possível carregar os dados desta trilha.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/pessoas/carreira">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Voltar
            </Button>
          </Link>
          <Button size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!careerPath) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
      >
        <span className="text-4xl">🔍</span>
        <h3 className="mt-3 font-semibold">Trilha não encontrada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Esta trilha não existe ou você não tem acesso.
        </p>
        <Link href="/pessoas/carreira" className="mt-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Voltar
          </Button>
        </Link>
      </motion.div>
    );
  }

  const baseTrack = careerPath.career_tracks.find((t) => t.track_type === "base");
  const levelCount =
    (baseTrack?.career_levels.length ?? 0) +
    careerPath.career_tracks.filter((t) => t.track_type !== "base")
      .reduce((s, t) => s + t.career_levels.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/pessoas/carreira" className="hover:text-foreground transition-colors">
          Trilhas de Carreira
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{careerPath.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/pessoas/carreira">
            <Button variant="ghost" size="icon" className="mt-0.5 h-8 w-8 focus-visible:ring-2 focus-visible:ring-orange-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{careerPath.icon ?? "🏢"}</span>
              <h1 className="text-2xl font-bold tracking-tight">{careerPath.name}</h1>
            </div>
            {careerPath.description && (
              <p className="text-muted-foreground mt-1">{careerPath.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            {levelCount} níveis
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {members?.length ?? 0} membros
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ladder principal */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Escada de Carreira
          </h2>
          <CareerLadder careerPath={careerPath} />
        </div>

        {/* Membros do núcleo */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Time ({members?.length ?? 0})
          </h2>

          {membersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (members ?? []).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-dashed p-6 text-center"
            >
              <Users className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Nenhum membro neste núcleo ainda.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-2"
            >
              {(members as PathMember[]).map((member) => (
                <motion.div key={member.id} variants={fadeIn}>
                  <Link href={`/pessoas/equipe/${member.id}`}>
                    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-all hover:shadow-sm hover:border-orange-200 active:scale-[0.99] cursor-pointer group">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {(member.full_name ?? "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate group-hover:text-orange-700 transition-colors">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.nivel_atual ?? member.cargo ?? "—"}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
