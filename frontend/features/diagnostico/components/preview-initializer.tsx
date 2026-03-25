"use client"

import { useEffect } from "react"
import { usePreviewStore } from "../stores/preview-store"
import { PreviewBanner } from "./preview-banner"
import { PricingDialog } from "./pricing-dialog"

export function PreviewInitializer() {
  const setPreview = usePreviewStore((s) => s.setPreview)
  const pricingOpen = usePreviewStore((s) => s.pricingOpen)
  const closePricing = usePreviewStore((s) => s.closePricing)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPreview = sessionStorage.getItem("academy_preview") === "true"
      setPreview(isPreview)
    }
  }, [setPreview])

  return (
    <>
      <PreviewBanner />
      <PricingDialog open={pricingOpen} onOpenChange={closePricing} />
    </>
  )
}
