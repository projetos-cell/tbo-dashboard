"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CareerLadder } from "@/features/career-paths/components/career-ladder";
import { useCareerPath, usePathMembers } from "@/features/career-paths/hooks/use-career-paths";
import type { PathMember } from "@/features/career-paths/services/career-paths";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{ pathId: string }>;
}

export default function CarreiraPathPage({ params }: PageProps) {
  const { pathId } = use(params);
  const { data: careerPath, isLoading } = useCareerPath(pathId);
  const { data: members } = usePathMembers(pathId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!careerPath) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
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
      </div>
    );
  }

  const baseTrack = careerPath.career_tracks.find((t) => t.track_type === "base");
  const levelCount =
    (baseTrack?.career_levels.length ?? 0) +
    careerPath.career_tracks.filter((t) => t.track_type !== "base")
      .reduce((s, t) => s + t.career_levels.length, 0);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/pessoas/carreira">
            <Button variant="ghost" size="icon" className="mt-0.5 h-8 w-8">
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
          <div className="space-y-2">
            {(members ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum membro neste núcleo ainda.
              </p>
            ) : (
              (members as PathMember[] ?? []).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(member.full_name ?? "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.nivel_atual ?? member.cargo ?? "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
