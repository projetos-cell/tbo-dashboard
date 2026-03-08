"use client"

import * as React from "react"
import { Tooltip } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: React.ComponentProps<typeof Tooltip.Provider> & { delayDuration?: number }) {
  return (
    <Tooltip.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function TooltipRoot({
  ...props
}: React.ComponentProps<typeof Tooltip.Root>) {
  return <Tooltip.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof Tooltip.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <Tooltip.Trigger
        data-slot="tooltip-trigger"
        render={children as React.ReactElement}
        {...props}
      />
    )
  }
  return (
    <Tooltip.Trigger data-slot="tooltip-trigger" {...props}>
      {children}
    </Tooltip.Trigger>
  )
}

function TooltipContent({
  className,
  sideOffset = 0,
  side,
  align,
  children,
  ...props
}: React.ComponentProps<typeof Tooltip.Popup> & {
  sideOffset?: number
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
}) {
  return (
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={sideOffset} side={side} align={align}>
        <Tooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[ending-style]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance",
            className
          )}
          {...props}
        >
          {children}
          <Tooltip.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  )
}

export {
  TooltipRoot as Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
}
