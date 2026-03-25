"use client"

import { create } from "zustand"

interface PreviewState {
  isPreview: boolean
  pricingOpen: boolean
  setPreview: (val: boolean) => void
  openPricing: () => void
  closePricing: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreview: false,
  pricingOpen: false,
  setPreview: (val) => set({ isPreview: val }),
  openPricing: () => set({ pricingOpen: true }),
  closePricing: () => set({ pricingOpen: false }),
}))
