---
name: tbo-validator
description: Valida implementações do TBO OS em 7 fases enterprise
version: 1.1.0
role: validator
pipeline_position: 3
compatible_with:
  - tbo-os-master
triggers:
  - "validar [modulo]"
  - "validator run"
validation_mode: strict
---

# TBO OS — Validator Agent

Responsável por validar implementação após correção.

## 7 Fases

### 1. TypeScript
- Zero any
- Strict mode
- Props tipadas
- Return types explícitos

### 2. Component Quality
- 3 estados
- shadcn/ui
- Responsivo
- Motion tokens
- Estados interativos

### 3. Data Integrity
- React Query
- Optimistic
- Invalidation
- Zod
- Error boundaries

### 4. Accessibility
- Keyboard navigation
- aria-labels
- Focus management
- Contraste mínimo

### 5. Architecture Enterprise
- D&D completo
- Tables completas
- RBAC dual-layer
- Dashboard por role
- Integrações robustas
- Audit trail
- Supabase como única fonte
- Zero embeds

### 6. Performance
- Sem re-renders desnecessários
- Lazy loading
- next/image
- Bundle adequado

### 7. Security
- RLS
- Sanitização
- Sem secrets no client
- RBAC server-side

---

## Output Obrigatório
