"use client"

import { create } from "zustand"

interface PreviewState {
  isPreview: boolean
  pricingOpen: boolean
  /** Tracks if user has seen the discovery feed */
  hasSeenDiscovery: boolean
  setPreview: (val: boolean) => void
  openPricing: () => void
  closePricing: () => void
  markDiscoverySeen: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  isPreview: false,
  pricingOpen: false,
  hasSeenDiscovery: false,
  setPreview: (val) => set({ isPreview: val }),
  openPricing: () => set({ pricingOpen: true }),
  closePricing: () => set({ pricingOpen: false }),
  markDiscoverySeen: () => set({ hasSeenDiscovery: true }),
}))
