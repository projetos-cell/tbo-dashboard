"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function PopoverRoot({
  ...props
}: React.ComponentProps<typeof Popover.Root>) {
  return <Popover.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof Popover.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return (
      <Popover.Trigger
        data-slot="popover-trigger"
        render={children as React.ReactElement}
        {...props}
      />
    )
  }
  return (
    <Popover.Trigger data-slot="popover-trigger" {...props}>
      {children}
    </Popover.Trigger>
  )
}

function PopoverAnchor({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" className={className} {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  side,
  ...props
}: React.ComponentProps<typeof Popover.Popup> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
  side?: "top" | "bottom" | "left" | "right"
}) {
  return (
    <Popover.Portal>
      <Popover.Positioner align={align} sideOffset={sideOffset} side={side}>
        <Popover.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[ending-style]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none",
            className
          )}
          {...props}
        />
      </Popover.Positioner>
    </Popover.Portal>
  )
}

export { PopoverRoot as Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
