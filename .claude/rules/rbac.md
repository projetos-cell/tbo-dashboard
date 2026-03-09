---
description: Rules for RBAC, permissions, and role-based access control
globs: ["**/rbac/**", "**/auth/**", "**/permissions/**", "**/middleware/**", "**/guards/**", "**/*guard*", "**/*permission*", "**/*role*"]
---

# RBAC Rules (4 Roles)

## Hierarchy
founder (4) > diretoria (3) > lider (2) > colaborador (1)

## Permission Matrix
- Financeiro (DRE, Caixa, Pipeline): founder + diretoria ONLY
- Intelligence: founder + diretoria full, lider parcial, colaborador NEVER
- RBAC management: founder ONLY
- Audit logs: founder + diretoria ONLY
- OKRs criar: founder + diretoria. Check-in: todos (proprios)
- Projetos criar: founder + diretoria + lider. Ver: todos (atribuidos para colaborador)
- 1:1 conduzir: founder + diretoria + lider. Participar: todos
- Reconhecimentos: todos

## Implementation Rules
- ALWAYS dual-layer: RBACGuard component (frontend) + RLS policy (Supabase backend)
- NEVER trust frontend-only guards for security
- Dashboard MUST render different widgets per role
- Data above permission level MUST be hidden, not just disabled
- Use RBACGuard component with minRole or allowedRoles props
