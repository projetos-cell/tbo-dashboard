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
  /** Quando definido, exibe badge e desabilita clique (card ainda clicável se `href` também definido) */
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
    <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6 md:p-8">
      {/* Ícone decorativo de fundo */}
      <CardIcon
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 h-28 w-28 text-foreground opacity-10 transition-opacity duration-300 group-hover:opacity-[0.15]"
      />

      {/* Label */}
      <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>

      {/* Título + badge de status */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h3 className="text-3xl font-bold leading-none">{title}</h3>
        {status && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <IconClock className="h-3 w-3" />
            {status}
          </Badge>
        )}
      </div>

      {/* Descrição */}
      <p className="mb-6 leading-relaxed text-muted-foreground">{description}</p>

      {/* CTA */}
      {isComingSoon ? (
        <span className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full border border-border/30 px-5 py-2.5 text-sm font-medium text-muted-foreground/50">
          <ActionIcon className="h-4 w-4" />
          {ctaLabel ?? status}
        </span>
      ) : ctaLabel ? (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/40 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors duration-200 group-hover:border-white/20 group-hover:bg-white/10">
          <ActionIcon className="h-4 w-4" />
          {ctaLabel}
          <IconExternalLink className="h-3.5 w-3.5 opacity-50" />
        </span>
      ) : null}
    </div>
  )

  const base = cn(
    "group relative overflow-hidden rounded-3xl border border-white/5 backdrop-blur-md",
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
          "cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        )}
      >
        {inner}
      </a>
    )
  }

  return <div className={base}>{inner}</div>
}
