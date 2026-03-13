"use client"

import * as React from "react"
import { IconCalendar } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DateRange {
  start: Date | null
  end: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
  placeholder?: string
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function parseLocalDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value + "T00:00:00")
  return isNaN(d.getTime()) ? null : d
}

function toInputValue(date: Date | null): string {
  if (!date) return ""
  return date.toISOString().split("T")[0]
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Selecionar período",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [start, setStart] = React.useState(toInputValue(value.start))
  const [end, setEnd] = React.useState(toInputValue(value.end))

  // Sync external value into local state
  React.useEffect(() => {
    setStart(toInputValue(value.start))
    setEnd(toInputValue(value.end))
  }, [value.start, value.end])

  const handleApply = () => {
    onChange({
      start: parseLocalDate(start),
      end: parseLocalDate(end),
    })
    setOpen(false)
  }

  const handleClear = () => {
    setStart("")
    setEnd("")
    onChange({ start: null, end: null })
    setOpen(false)
  }

  const label =
    value.start && value.end
      ? `${formatDate(value.start)} → ${formatDate(value.end)}`
      : value.start
      ? `${formatDate(value.start)} → …`
      : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal gap-1.5",
            !value.start && !value.end && "text-muted-foreground",
            className
          )}
        >
          <IconCalendar className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Início</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fim</label>
            <input
              type="date"
              value={end}
              min={start || undefined}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" onClick={handleApply}>
              Aplicar
            </Button>
            {(value.start || value.end) && (
              <Button size="sm" variant="ghost" onClick={handleClear}>
                Limpar
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
