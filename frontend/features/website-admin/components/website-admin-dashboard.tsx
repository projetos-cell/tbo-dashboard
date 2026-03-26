"use client";

import { useRouter } from "next/navigation";
import {
  IconWorld,
  IconFolder,
  IconLayout,
  IconSettings,
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconFileOff,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsiteProjects } from "../hooks/use-website-projects";

export function WebsiteAdminDashboard() {
  const router = useRouter();
  const { data: projects, isLoading } = useWebsiteProjects();

  const published = projects?.filter((p) => p.status === "publicado").length ?? 0;
  const drafts = projects?.filter((p) => p.status === "rascunho").length ?? 0;
  const total = projects?.length ?? 0;

  const cards = [
    {
      title: "Projetos",
      description: "Gerencie o portfólio do site",
      icon: IconFolder,
      href: "/website-admin/projetos",
      stat: isLoading ? null : `${total} projetos`,
    },
    {
      title: "Seções do Site",
      description: "Edite conteúdo de cada página",
      icon: IconLayout,
      href: "/website-admin/paginas",
      stat: "Home, Sobre, Serviços, Contato",
    },
    {
      title: "Configurações",
      description: "SEO, contato e redes sociais",
      icon: IconSettings,
      href: "/website-admin/config",
      stat: "Dados gerais",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Website Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie o conteúdo do site sem precisar programar
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="rounded-full bg-green-500/10 p-2">
            <IconCircleCheck className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-8 inline-block" /> : published}
            </p>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="rounded-full bg-amber-500/10 p-2">
            <IconClock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-8 inline-block" /> : drafts}
            </p>
            <p className="text-xs text-muted-foreground">Rascunhos</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <IconWorld className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-8 inline-block" /> : total}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.href}
            type="button"
            onClick={() => router.push(card.href)}
            className="group rounded-lg border bg-card p-6 text-left hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-lg bg-muted p-2.5">
                <card.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <IconArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {card.description}
            </p>
            {card.stat && (
              <p className="text-[10px] text-muted-foreground/60">
                {card.stat}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
