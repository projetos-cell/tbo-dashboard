"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InlineEditableProps {
  value: string
  onSave: (value: string) => void
  variant?: "h1" | "h2" | "small"
  placeholder?: string
  className?: string
  disabled?: boolean
}

const variantStyles: Record<NonNullable<InlineEditableProps["variant"]>, string> = {
  h1: "text-2xl font-bold tracking-tight",
  h2: "text-lg font-semibold",
  small: "text-sm",
}

export function InlineEditable({
  value,
  onSave,
  variant = "small",
  placeholder = "—",
  className,
  disabled = false,
}: InlineEditableProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setDraft(value)
  }, [value])

  React.useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  if (disabled) {
    return (
      <span className={cn(variantStyles[variant], "text-foreground", className)}>
        {value || placeholder}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit() }
          if (e.key === "Escape") { e.preventDefault(); cancel() }
        }}
        className={cn(
          variantStyles[variant],
          "bg-transparent border-b border-primary outline-none w-full text-foreground",
          className
        )}
      />
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setEditing(true) }}
      className={cn(
        variantStyles[variant],
        "cursor-text hover:bg-muted/50 rounded px-0.5 -mx-0.5 transition-colors text-foreground",
        !value && "text-muted-foreground",
        className
      )}
    >
      {value || placeholder}
    </span>
  )
}
