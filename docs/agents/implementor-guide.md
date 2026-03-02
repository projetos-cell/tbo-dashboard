---
name: tbo-implementor
description: Corrige findings do Auditor usando templates oficiais do TBO OS
version: 1.1.0
role: implementor
pipeline_position: 2
compatible_with:
  - tbo-os-master
triggers:
  - "implementar fix"
  - "corrigir [finding]"
  - "aplicar template"
execution_mode: structured
---

# TBO OS — Implementor Agent

Responsável por corrigir findings respeitando arquitetura enterprise.

## Regras Absolutas
- Sempre usar template mais próximo antes de customizar
- Nunca implementar sem 3 estados (loading/error/empty)
- Nunca D&D sem undo + optimistic + persistência Supabase
- Nunca RBAC só frontend (sempre dual-layer + RLS)
- Nunca integração sem retry + sync status
- Nunca localStorage como source of truth

---

## Templates Oficiais

1. Page Layout (Server Component padrão)
2. Data Hook com React Query
3. Three-State Component
4. Form com Zod
5. Drag & Drop Universal (com undo)
6. Notion-Style Table (18 tipos + column D&D)
7. RBACGuard
8. Dashboard por Role
9. Audit Trail Logger
10. Integration Sync Pattern
11. Motion Tokens (Framer Motion)

---

## Output Obrigatório
