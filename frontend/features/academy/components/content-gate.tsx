"use client"

import { useState } from "react"
import { IconLock } from "@tabler/icons-react"
import { useAcademyEntitlement } from "@/features/academy/hooks/use-academy-entitlement"
import { PricingDialog } from "@/features/diagnostico/components/pricing-dialog"
import { cn } from "@/lib/utils"
import type { ProductSlug } from "@/features/academy/hooks/use-academy-entitlement"

interface ContentGateProps {
  children: React.ReactNode
  requiredProduct?: ProductSlug
  /** Custom label shown on the upgrade overlay */
  label?: string
}

const PRODUCT_TIER: Record<ProductSlug, number> = {
  diagnostic: 0,
  essencial: 1,
  profissional: 2,
  enterprise: 3,
}

export function ContentGate({
  children,
  requiredProduct = "essencial",
  label = "Desbloqueie este conteúdo",
}: ContentGateProps) {
  const [pricingOpen, setPricingOpen] = useState(false)
  const { product, isLoading } = useAcademyEntitlement()

  // While loading, render children transparently (skeleton handled by parent)
  if (isLoading) {
    return <>{children}</>
  }

  const hasAccess = PRODUCT_TIER[product] >= PRODUCT_TIER[requiredProduct]

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Blurred preview */}
        <div
          className={cn(
            "select-none pointer-events-none",
            "blur-sm saturate-50 opacity-60"
          )}
          aria-hidden="true"
        >
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[2px] rounded-xl">
          <div className="flex flex-col items-center gap-3 text-center px-6 max-w-xs">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#0a1f1d] text-[#b8f724]">
              <IconLock className="size-5" />
            </div>
            <p className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {label}
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Este conteúdo está disponível a partir do plano Essencial.
            </p>
            <button
              onClick={() => setPricingOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#b8f724] px-5 py-2.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#0a1f1d] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(184,247,36,0.25)]"
            >
              Ver planos →
            </button>
          </div>
        </div>
      </div>

      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </>
  )
}
