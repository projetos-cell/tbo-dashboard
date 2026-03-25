"use client"

import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { Answers } from "../components/diagnostic-questions-step"

const STORAGE_KEY = "diagnostic_draft"
const DEBOUNCE_MS = 300

interface ContextFormData {
  stage: string
  vgv: string
  freq: string
  dep: string
  invest: string
}

interface DiagnosticDraft {
  answers: Answers
  contextData: ContextFormData
  currentStep: number
  updatedAt: string
}

interface UseDiagnosticPersistenceOptions {
  answers: Answers
  contextData: ContextFormData
  currentStep: number
  onRestore: (draft: DiagnosticDraft) => void
}

export function useDiagnosticPersistence({
  answers,
  contextData,
  currentStep,
  onRestore,
}: UseDiagnosticPersistenceOptions) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoredRef = useRef(false)

  // Restore on mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const draft = JSON.parse(raw) as DiagnosticDraft
      const hasAnswers = Object.keys(draft.answers ?? {}).length > 0
      const hasContext =
        draft.contextData &&
        (draft.contextData.stage ||
          draft.contextData.vgv ||
          draft.contextData.freq)

      if (!hasAnswers && !hasContext) return

      onRestore(draft)
      toast.info("Progresso restaurado", { duration: 3000 })
    } catch {
      // Malformed draft — ignore silently
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [onRestore])

  // Save on change (debounced)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      try {
        const draft: DiagnosticDraft = {
          answers,
          contextData,
          currentStep,
          updatedAt: new Date().toISOString(),
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      } catch {
        // Storage quota exceeded — ignore
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [answers, contextData, currentStep])

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return { clearDraft }
}
