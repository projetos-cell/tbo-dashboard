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

## Optimistic Updates (MANDATORY)
- EVERY mutation (create, update, delete) MUST have optimistic update via onMutate
- Remove/add/modify item in cache BEFORE server confirms
- ALWAYS include rollback on error (restore previous cache state)
- ALWAYS cancel in-flight queries before optimistic update (queryClient.cancelQueries)
- ALWAYS invalidate ALL related query keys on settled (e.g. ["tasks"] AND ["my-tasks"] AND ["dashboard"])
- Pattern: onMutate (optimistic) -> onError (rollback) -> onSettled (invalidate all related keys)
- NEVER rely only on onSettled/invalidation for UI updates — the user must see the change immediately

## Whitespace
- Cards: p-4 minimum internal padding
- Sections: space-y-6 between major sections
- The interface must "breathe" â€” avoid visual clutter
