---
name: tbo-os-roadmap
description: "TBO OS 2026 product roadmap — 4 phases, 15 sprints, 16 weeks. Use this skill whenever working on TBO OS platform development, sprint planning, task breakdown, implementation of any TBO OS module (Access Control, Cultura, OKRs, 1:1s, Reconhecimentos, Projetos, Reportei, Rituais, Chat), checking dependencies between sprints, estimating effort, or when the user references any sprint ID (1.1, 2.1, 3.2, 4.x, etc.). Also trigger when the user mentions: TBO OS, roadmap TBO, sprint planning, workspace diretoria, módulo cultura, sistema OKRs, Fireflies integration, PDI, reconhecimentos, quadro de projetos, Reportei, rituais, or chat TBO."
---

# TBO OS — Roadmap 2026

**4 Fases | 15 Sprints | ~16 Semanas**
Priorizado por: dependências técnicas → impacto operacional → complexidade

**Stack base:** Supabase (PostgreSQL + RLS) + Next.js 14 (App Router + Edge Functions) + React Query + TypeScript + shadcn/ui

## Como usar esta skill

1. **Consultar sprint específico** → Leia o reference file da fase correspondente (`references/fase-N.md`)
2. **Planejar próxima sprint** → Verifique dependências no mapa abaixo antes de iniciar
3. **Implementar tarefa** → Leia o detalhamento técnico da sprint no reference file e siga a sequência de execução
4. **Estimar esforço** → Consulte a tabela de esforço abaixo
5. **Avaliar riscos** → Consulte `references/riscos.md`

## Visão geral das fases

| Fase | Tema | Sprints | Semanas | Horas Est. | Prioridade |
|------|------|---------|---------|------------|------------|
| 1 | Infraestrutura & Governança | 1.1, 1.2 | 1-3 | 15-20h | Crítica |
| 2 | Gestão de Pessoas & Performance | 2.1, 2.2, 2.3 | 4-7 | 50-70h | Alta |
| 3 | Experiência & Integrações | 3.1, 3.2, 3.3 | 8-11 | 40-55h | Média-Alta |
| 4 | Comunicação Interna (Chat TBO) | 4.1, 4.2, 4.3 | 12-16 | 60-80h | Média |
| **TOTAL** | | **15 sprints** | **16 sem** | **165-225h** | |

> Estimativas assumem 1 dev full-stack + Claude Code como acelerador. Sprints 3.1 e 3.2 podem rodar em paralelo.

## Índice de sprints

| Sprint | Nome | Reference file |
|--------|------|----------------|
| 1.1 | Access Control & Workspace Diretoria | `references/fase-1.md` |
| 1.2 | Correção Módulo de Cultura | `references/fase-1.md` |
| 2.1 | Sistema de OKRs Nativo | `references/fase-2.md` |
| 2.2 | 1:1 Integrado com Fireflies + PDI | `references/fase-2.md` |
| 2.3 | Sistema de Reconhecimentos + Pontuação | `references/fase-2.md` |
| 3.1 | Quadro de Projetos: UX Redesign | `references/fase-3.md` |
| 3.2 | Reportei API + Independência de Dados | `references/fase-3.md` |
| 3.3 | 1:1s & Rituais Expandidos | `references/fase-3.md` |
| 4.1 | Infraestrutura de Chat | `references/fase-4.md` |
| 4.2 | Rich Media & Anexos | `references/fase-4.md` |
| 4.3 | Grupos, DMs & Tópicos | `references/fase-4.md` |

## Mapa de dependências

```
1.1 Access Control ──────┬──→ 2.1 OKRs Nativo
(pré-requisito global)   ├──→ 2.2 1:1 + Fireflies ──→ 2.3 Reconhecimentos
                         ├──→ 3.3 Rituais Expandidos (via 2.2)
                         └──→ 4.x Chat TBO

1.2 Correção Cultura ────── (independente)
3.1 Projetos UX ─────────── (independente)
3.2 Reportei + Supabase ─── (independente)
```

**Regras de sequenciamento:**
- Nunca iniciar sprint da Fase 2+ sem 1.1 estável
- Sprint 2.3 requer 2.2 (usa Fireflies parser)
- Sprint 3.3 requer 2.2 (usa infraestrutura de 1:1)
- Sprints independentes (1.2, 3.1, 3.2) podem rodar em paralelo com qualquer fase

## Lógica de fases

- **Fase 1** resolve permissões e corrige bases quebradas (pré-requisito para tudo)
- **Fase 2** constrói o sistema de gestão de pessoas (OKRs + 1:1 + PDI + reconhecimentos são interdependentes)
- **Fase 3** melhora UX e integra dados externos
- **Fase 4** é o chat — módulo mais complexo e independente dos demais

## Instruções para o agente

Ao receber uma tarefa relacionada ao TBO OS:

1. **Identifique qual sprint** a tarefa pertence (pelo ID ou contexto)
2. **Leia o reference file** da fase correspondente para obter detalhamento técnico completo
3. **Verifique dependências** no mapa acima — se a sprint depende de outra não concluída, alerte o usuário
4. **Siga a sequência de execução** documentada em cada sprint (dia a dia)
5. **Valide contra critérios de aceitação** ao finalizar cada tarefa
6. **Consulte `references/riscos.md`** se encontrar bloqueios técnicos

Ao gerar código ou implementar:
- Use a stack técnica definida (Supabase + Next.js 14 + React Query + TypeScript + shadcn/ui)
- Implemente RLS policies no Supabase para qualquer dado sensível
- Siga o padrão de proxy API via Vercel Edge Functions (credenciais em env vars, nunca no frontend)
- Teste permissões por role: founder, PO, colaborador
