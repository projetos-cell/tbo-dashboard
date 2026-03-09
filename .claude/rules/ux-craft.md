---
description: UX craft, animations, and delight patterns
globs: ["**/components/**", "**/*.tsx", "**/features/**"]
---

# UX Craft Rules (Apple-Level)

## Motion Tokens (Framer Motion)
- fast: 0.15s | normal: 0.25s | slow: 0.4s
- Ease out for entrances, ease in for exits
- Spring for interactive elements (stiffness: 300, damping: 24)
- Stagger children: 0.05s delay between items

## Every Interactive Element MUST Have
- Hover state (subtle but perceptible)
- Focus ring (styled, not browser default)
- Active/pressed state
- Disabled state (when applicable)

## State Transitions
- Loading -> Content: fade in with skeleton that matches layout
- Empty -> Content: fade in
- Content -> Error: slide down error banner
- Any modal/drawer: scale + fade enter, fade exit

## Feedback Rules
- Every user action: feedback in <100ms
- Toast timing: 3-5 seconds auto-dismiss
- Destructive actions: confirmation dialog
- Save actions: optimistic + success toast
- Error actions: inline message + retry button

## Whitespace
- Cards: p-4 minimum internal padding
- Sections: space-y-6 between major sections
- The interface must "breathe" â€” avoid visual clutter
