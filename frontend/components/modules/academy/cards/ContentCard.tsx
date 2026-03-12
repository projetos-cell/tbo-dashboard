"use client"

import type { SVGProps } from "react"
import { IconClock, IconExternalLink } from "@tabler/icons-react"
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
  label: string
  description: string
  icon: TablerIcon
  gradient: string
  ctaLabel?: string
  ctaIcon?: TablerIcon
  status?: string
  href?: string
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
    <div className="relative flex h-full items-center justify-between gap-6 px-5 py-0">
      {/* Ícone decorativo de fundo */}
      <CardIcon
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 text-white opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
      />

      {/* Texto — label empilhada sobre título */}
      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-bold leading-none text-white/90">{title}</h3>
          {status && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-medium text-white/40">
              <IconClock className="h-2.5 w-2.5" />
              {status}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-white/45">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="relative shrink-0">
        {isComingSoon ? (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-white/30">
            <ActionIcon className="h-3 w-3" />
            {ctaLabel ?? status}
          </span>
        ) : ctaLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-white/70 transition-all duration-200 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/90">
            <ActionIcon className="h-3 w-3" />
            {ctaLabel}
            <IconExternalLink className="h-2.5 w-2.5 opacity-50" />
          </span>
        ) : null}
      </div>
    </div>
  )

  const base = cn(
    "group relative h-full overflow-hidden rounded-xl border border-white/5 backdrop-blur-md",
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
          "cursor-pointer transition-all duration-200 hover:scale-[1.012] hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 ring-offset-background",
        )}
      >
        {inner}
      </a>
    )
  }

  return <div className={base}>{inner}</div>
}
