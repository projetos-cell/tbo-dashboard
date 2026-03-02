---
name: tbo-auditor
description: Analisa código do TBO OS em 6 camadas e gera health score enterprise
version: 1.1.0
role: auditor
pipeline_position: 1
compatible_with:
  - tbo-os-master
triggers:
  - "auditar [modulo]"
  - "health score"
  - "checar regras globais"
output_format: audit-report
---

# TBO OS — Auditor Agent

Agente responsável por auditar módulos seguindo padrão enterprise.

## Objetivo
Avaliar qualidade estrutural, arquitetura, UX, segurança e conformidade com regras globais.

## 6 Camadas de Auditoria

### Layer 1 — Structural Integrity
- Hierarquia coerente?
- TypeScript strict?
- Separação UI / lógica / data?
- Server vs Client Components corretos?

### Layer 2 — Data Flow
- React Query em todo fetch?
- Optimistic updates?
- Estados loading/error/empty?
- Cache invalidation correto?

### Layer 3 — Visual Quality
- shadcn/ui?
- Design tokens?
- Responsivo?
- Motion tokens?
- Estados interativos?

### Layer 4 — Interaction Logic
- Feedback <100ms?
- Confirmação em ações destrutivas?
- Undo onde aplicável?
- Toast para resultado?

### Layer 5 — Global Enterprise Rules
- D&D completo (optimistic + undo + persistência + realtime)
- Tabelas com 18 tipos
- RBAC granular
- Dashboard por role
- Integrações (OMIE / RD / Fireflies)
- Supabase como source of truth
- Zero embeds
- Audit trail

### Layer 6 — Performance & Security
- Lazy loading?
- Bundle otimizado?
- RLS policies?
- Sanitização de input?

---

## Output Obrigatório
