# TBO OS â€” Arquitetura Enterprise (Referencia)

> Source of truth para todos os agentes. Carregado sob demanda via @docs/architecture.md

## 3 Principios Estruturais
1. O TBO-OS deve responder diariamente: (1) Estamos ganhando dinheiro? (2) Estamos executando a estrategia? (3) Estamos formando lideres?
2. Single source of truth com Supabase persistence, RBAC, audit trail
3. Zero external embeds

## 7 Grupos de Modulos

| # | Grupo | Sub-modulos |
|---|-------|-------------|
| 1 | Dashboard | Founder View, Diretoria View, Lider View, Colaborador View |
| 2 | Estrategia | OKRs, Iniciativas, Roadmap, Scorecards |
| 3 | Execucao | Projetos, Backlog, Kanban, Gantt, Orcamento, Templates, RACI |
| 4 | Receita & Caixa | Pipeline, Receita, Fluxo, DRE, Centro Custo, Projecoes, OMIE, RD Station |
| 5 | Pessoas | Organograma, Colaboradores, PDI, 1:1, Performance, TBO Rewards, Carga |
| 6 | Cultura & Governanca | Pilares, Rituais, Manual, Politicas, RBAC, Logs, Auditoria |
| 7 | Intelligence | Rentabilidade Projeto/Cliente, ROI Comercial, Gargalos, Tendencias, Insights |

## Drag & Drop Universal
- Vertical D&D em todo modulo, secao, child
- Regras de secao: ao mover item, aplicar automaticamente status/tags/assignee/permissions do destino
- Persistencia: Supabase imediato (nunca local-only)
- Undo: Ctrl+Z obrigatorio com undo stack
- Optimistic update + rollback on error
- Realtime: broadcast para todos via Supabase Realtime

## Tabelas Notion-Style
- 18 tipos de propriedade: text, number, select, multi_select, status, person, checkbox, phone, date, files, url, email, relation, rollup, formula, id, created_at, updated_at
- D&D horizontal de colunas
- Filtros persistentes por view (salvos no Supabase)
- Sort combinavel (sort by A then B)
- Inline editing por tipo de propriedade

## RBAC â€” 4 Roles

| Permissao | founder | diretoria | lider | colaborador |
|-----------|---------|-----------|-------|-------------|
| Financeiro (DRE, Caixa) | full | full | â€” | â€” |
| Pipeline comercial | full | full | â€” | â€” |
| OKRs criar | sim | sim | â€” | â€” |
| OKRs check-in | sim | sim | sim | sim (proprios) |
| Projetos criar | sim | sim | sim | â€” |
| Projetos ver | todos | todos | todos | atribuidos |
| Intelligence | full | full | parcial | â€” |
| RBAC management | sim | â€” | â€” | â€” |
| Audit logs | sim | sim | â€” | â€” |
| 1:1 conduzir | sim | sim | sim | â€” |
| 1:1 participar | sim | sim | sim | sim |
| Reconhecimentos | sim | sim | sim | sim |

## Integracoes

| Sistema | Direcao | Alimenta |
|---------|---------|----------|
| OMIE (ERP) | OMIE -> TBO OS (read) + limited write | Receita & Caixa, DRE, Fluxo |
| RD Station (CRM) | Bidirecional | Pipeline, ROI, Intelligence |
| Fireflies | Fireflies -> TBO OS (read) | 1:1s, Action Items, PDI |

## Regras Tecnicas
1. Persistencia 100% Supabase â€” NUNCA localStorage como truth
2. RBAC duplo: frontend guard + RLS backend (SEMPRE ambos)
3. Zero embeds/iframes â€” tudo nativo
4. Audit trail: logar alteracoes criticas (quem, quando, o que, antes/depois)
5. Dashboard dinamico por role â€” widgets diferentes por permissao
6. Dados acima da permissao: OCULTOS, nao apenas desabilitados
