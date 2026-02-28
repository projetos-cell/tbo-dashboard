# TBO OS - Design System

> Architectural Visualization Studio | Curitiba/PR
> Brand Typeface: Helvetica Neue LT Pro
> Primary Palette: #E85102 (orange) + #0F0F0F (black) + #EAEAEA (gray)

---

## 1. Color Tokens

### Brand Palette (Orange Scale)
| Token | Hex | Usage |
|-------|-----|-------|
| `brand-orange` | `#E85102` | Primary brand color (Pantone 1655 C) |
| `brand-orange-light` | `#FD8241` | Hover states, highlights |
| `brand-orange-pale` | `#FED5C0` | Soft backgrounds, tags |
| `brand-orange-dark` | `#BE4202` | Primary accent, CTA buttons |
| `brand-orange-deep` | `#3F1601` | Dark mode accents |

### Neutral Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `white` | `#FFFFFF` | Card/sidebar backgrounds |
| `gray-100` | `#EAEAEA` | Page background, subtle borders |
| `gray-200` | `#DFDFDF` | Default borders, input bg |
| `gray-400` | `#9F9F9F` | Muted/placeholder text |
| `gray-600` | `#606060` | Secondary text |
| `gray-800` | `#202020` | Tooltip background |
| `black` | `#0F0F0F` | Primary text |
| `black-warm` | `#0F0400` | Overlay base |

### Semantic Colors
| Token | Hex | Dim | Usage |
|-------|-----|-----|-------|
| `success` | `#2ecc71` | `rgba(46,204,113,0.15)` | Positive states |
| `warning` | `#f39c12` | `rgba(243,156,18,0.15)` | Caution states |
| `danger` | `#e74c3c` | `rgba(231,76,60,0.15)` | Error/destructive |
| `info` | `#3a7bd5` | `rgba(58,123,213,0.15)` | Informational |
| `purple` | `#8b5cf6` | `rgba(139,92,246,0.15)` | Special accents |

### Module Accent Colors
| Module | Hex | Description |
|--------|-----|-------------|
| Dashboard | `#E85102` | Brand orange |
| Projetos | `#3b82f6` | Blue |
| Financeiro | `#10b981` | Emerald |
| Pessoas/RH | `#8b5cf6` | Purple |
| Comercial | `#f59e0b` | Amber |
| Mercado | `#14b8a6` | Teal |
| Cultura | `#ec4899` | Pink |

---

## 2. Typography

**Font Stack:**
- Display/Bold: `HelveticaNeueLTPro-Bd`
- Body/Roman: `HelveticaNeueLTPro-Roman`
- Mono: `JetBrains Mono`

| Scale | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| Display | 32px (2rem) | 800 | 1.1 | -0.02em |
| Heading | 24px (1.5rem) | 700 | 1.2 | -0.01em |
| Title | 17.6px (1.1rem) | 600 | 1.3 | 0 |
| Body | 14px (0.875rem) | 400 | 1.5 | 0 |
| Caption | 12px (0.75rem) | 500 | 1.4 | 0.01em |
| Overline | 10.4px (0.65rem) | 700 | 1.2 | 0.08em, UPPERCASE |

---

## 3. Spacing

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `xxl` | 32px |
| `xxxl` | 48px |

---

## 4. Border Radius

| Token | Value |
|-------|-------|
| `xs` | 3px |
| `sm` | 6px |
| `md` | 8px |
| `lg` | 12px |
| `xl` | 16px |
| `full` | 9999px |

---

## 5. Shadows

| Token | Value |
|-------|-------|
| `sm` | `0 1px 3px rgba(0,0,0,0.06)` |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `lg` | `0 8px 30px rgba(0,0,0,0.12)` |
| `xl` | `0 12px 48px rgba(0,0,0,0.18)` |
| `glow` | `0 0 16px rgba(232,81,2,0.15)` |

---

## 6. Layout

| Token | Value |
|-------|-------|
| `sidebar-width` | 260px |
| `sidebar-collapsed` | 64px |
| `content-max-width` | 1400px |

---

## 7. Transitions

| Token | Value |
|-------|-------|
| `fast` | 150ms ease |
| `base` | 200ms ease |
| `normal` | 250ms ease |
| `slow` | 400ms ease |
| `spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |

---

## 8. Z-Index Layers

| Layer | Value |
|-------|-------|
| Dropdown | 100 |
| Sticky | 200 |
| Header | 300 |
| Sidebar | 400 |
| Overlay | 500 |
| Modal | 600 |
| Toast | 700 |
| Tooltip | 800 |

---

## 9. Icon System

- **Library:** Lucide Icons (CDN)
- **Usage:** `<i data-lucide="icon-name"></i>` + `lucide.createIcons()`
- **Animations:** fadeIn, bounce, pulse, spin via `TBO_DESIGN.animateIcon()`

---

## 10. Component Patterns

### Buttons
- Primary: `bg: brand-orange-dark`, `color: white`, `radius: sm (6px)`
- Hover: `bg: brand-orange`, `shadow: glow`
- Ghost: `bg: transparent`, `border: gray-200`, `color: text-secondary`

### Cards
- `bg: white`, `border: 1px solid gray-100`, `radius: lg (12px)`, `shadow: sm`
- Hover: `shadow: md`, `border: gray-200`

### Inputs
- `bg: gray-200`, `border: 1px solid gray-200`, `radius: sm (6px)`
- Focus: `border: #D14800`, `shadow: 0 0 0 3px rgba(232,81,2,0.15)`

### Tags/Badges
- Default: `bg: accent-dim`, `color: accent`, `radius: full (pill)`
- Module: uses module accent color + dim variant

---

## Figma Import

Use **Tokens Studio** plugin to import `figma-tokens.json`:
1. Install "Tokens Studio for Figma" plugin
2. Open plugin > Settings > Import
3. Select `figma-tokens.json`
4. Apply "TBO Design System" set
5. Variables will be created automatically

**CSS Variables:** All tokens map 1:1 to CSS custom properties in `styles.css`
**JS Tokens:** Available via `window.TBO_DESIGN.tokens` in `utils/design-system.js`
