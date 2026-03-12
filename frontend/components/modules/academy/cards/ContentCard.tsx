"use client"

import type { SVGProps } from "react"
import { IconClock, IconExternalLink } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TablerIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string
  stroke?: number | string
}
export type TablerIcon = React.ForwardRefExoticComponent<
  TablerIconProps & React.RefAttributes<SVGSVGElement>
>

export type ContentCardProps = {
  title: string
  /** Rótulo de categoria em caixa alta — ex: "ÁUDIO", "LEITURA", "VÍDEO" */
  label: string
  description: string
  /** Ícone Tabler usado tanto na decoração de fundo quanto no CTA */
  icon: TablerIcon
  /**
   * Classe(s) do degradê — deve ser uma string Tailwind completa para garantir
   * que o PurgeCSS/Oxide detecte as classes estáticas.
   * Ex: "bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-secondary/20"
   */
  gradient: string
  /** Texto do botão de ação na base do card */
  ctaLabel?: string
  /** Ícone opcional para o CTA (usa `icon` como fallback) */
  ctaIcon?: TablerIcon
  /** Quando definido, exibe badge e desabilita clique */
  status?: string
  /** URL externa — torna o card inteiro um link clicável */
  href?: string
  /** Classes extras para grid span, altura, etc. */
  className?: string
}

export function ContentCard({
  title,
  label,
  description,
  icon: CardIcon,
  gradient,
  ctaLabel,
  ctaIcon: CtaIcon,
  status,
  href,
  className,
}: ContentCardProps) {
  const isComingSoon = !!status && !href
  const ActionIcon = CtaIcon ?? CardIcon

  const inner = (
    /* Layout horizontal: texto à esquerda, CTA à direita */
    <div className="relative flex h-full items-center justify-between gap-4 px-6 py-4">
      {/* Ícone decorativo de fundo — centralizado verticalmente, à direita */}
      <CardIcon
        aria-hidden
        className="pointer-events-none absolute right-5 top-1/2 h-20 w-20 -translate-y-1/2 text-foreground opacity-10 transition-opacity duration-300 group-hover:opacity-[0.15]"
      />

      {/* Coluna de texto */}
      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl font-bold leading-none">{title}</h3>
          {status && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <IconClock className="h-3 w-3" />
              {status}
            </Badge>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>

      {/* CTA — encolhe, não quebra */}
      <div className="relative shrink-0">
        {isComingSoon ? (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-border/30 px-4 py-2 text-xs font-medium text-muted-foreground/50">
            <ActionIcon className="h-3.5 w-3.5" />
            {ctaLabel ?? status}
          </span>
        ) : ctaLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-white/5 px-4 py-2 text-xs font-medium transition-colors duration-200 group-hover:border-white/20 group-hover:bg-white/10">
            <ActionIcon className="h-3.5 w-3.5" />
            {ctaLabel}
            <IconExternalLink className="h-3 w-3 opacity-50" />
          </span>
        ) : null}
      </div>
    </div>
  )

  const base = cn(
    "group relative h-full overflow-hidden rounded-2xl border border-white/5 backdrop-blur-md",
    gradient,
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          base,
          "cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        )}
      >
        {inner}
      </a>
    )
  }

  return <div className={base}>{inner}</div>
}
