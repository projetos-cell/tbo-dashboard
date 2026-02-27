# Fase 1 — Infraestrutura & Governança

**Semanas 1-3 | 2 Sprints | Prioridade: Crítica**

Resolver problemas de base que bloqueiam avanços. Sem esta fase, qualquer módulo novo herdaria problemas de permissão e navegação.

---

## Sprint 1.1 — Access Control & Workspace Diretoria

### Contexto
Criar segregação de dados e acesso baseado em papéis. Implementar workspace isolado para decisões estratégicas (Diretoria) acessível apenas por founders, mover Analytics de Pessoas para esse contexto, implementar auditoria.

### Stack Técnico
Supabase (PostgreSQL + RLS) + Next.js 14 (App Router + Edge Functions) + React Query + TypeScript

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 1.1.1 | Workspace Diretoria: acesso restrito a founders | Implementar RLS policy no Supabase que filtra `workspace_id = 'diretoria'` por `user_role IN ('founder')`. Frontend oculta menu e rotas #diretoria-* para non-founders. Middleware server-side nas Edge Functions. | Alto | ● |
| 1.1.2 | Migrar módulo 'Analytics de Pessoas' para Diretoria | Mover rota #people-analytics para #diretoria-analytics. Atualizar sidebar mapping, breadcrumbs, permissões. Dados permanecem nas mesmas tabelas Supabase, apenas UI/acesso muda. | Médio | ● |
| 1.1.3 | Audit log de acessos sensíveis | Criar tabela `audit_log` (user_id, action, resource, timestamp) com trigger automático. Visível apenas para founders. Append-only (não pode ser deletado). | Baixo | ● |

### Sequência de Execução

**Dia 1 — Backend (Segurança primeiro)**
1. Migration RLS + tabela workspaces
2. Migration audit_logs + trigger
3. Atualizar session/JWT para incluir user_role

**Dia 2 — Frontend (Navegação + Acesso)**
1. Criar layout `/diretoria` com middleware check
2. Mover componentes de Analytics
3. Atualizar sidebar navigation
4. Criar página /diretoria/audit

**Dia 3 — Testes + Hardening**
1. Testar fluxo: founder acessa → works; non-founder acessa → 403
2. Testar audit log automático
3. Testar permissões de DELETE (deve falhar)

### Critérios de Aceitação

- [ ] RLS policy bloqueia non-founders em nível de banco de dados
- [ ] Middleware redireciona antes de servir componentes React
- [ ] Analytics funciona em `/diretoria-analytics` com dados históricos intactos
- [ ] Audit log registra acessos automaticamente
- [ ] Founder consegue visualizar audit log, non-founder não
- [ ] Logs são append-only
- [ ] Sem erros no console; sem queries N+1

### Próximo Nível (Sprint 1.2)

Após 1.1 estável:
- Workspace Executivo (viewable by Ruy + Marco)
- Workspace Geral (accessible by all)
- Permission inheritance (roles por workspace)
- Data filters (cada workspace filtra dados por workspace_id)

---

## Sprint 1.2 — Correção Módulo de Cultura

### Contexto
O módulo cultura (#cultura-*) tem rotas quebradas, navegação incorreta, e conteúdo faltando. Esta sprint resolve problemas de base do módulo antes de expandi-lo.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 1.2.1 | Audit de rotas e caminhos quebrados | Mapear todas as rotas do módulo cultura. Identificar links mortos, redirecionamentos incorretos, páginas que retornam 404 ou conteúdo vazio. Documentar em checklist. | Médio | ● |
| 1.2.2 | Correção de navegação e breadcrumbs | Corrigir hash routing no app.js para rotas do módulo cultura. Garantir que sidebar highlights, breadcrumbs, e back navigation funcionem corretamente. | Médio | ● |
| 1.2.3 | Validação de conteúdo carregado | Verificar se todo conteúdo do módulo cultura (valores, manual, políticas) carrega corretamente do Supabase. Corrigir queries com joins quebrados. Fallback para conteúdo estático se necessário. | Médio | ● |
| 1.2.4 | Testes de navegação end-to-end | Testar cada página do módulo cultura como founder, PO, e colaborador. Validar permissões de visualização/edição por role. Documentar bugs remanescentes. | Baixo | ● |

### Critérios de Aceitação

- [ ] Todas as rotas #cultura-* retornam 200 ou redirect válido
- [ ] Breadcrumbs corretos em cada página
- [ ] Conteúdo carrega do Supabase sem N+1 queries
- [ ] Permissões de role funcionam (founder edita, colaborador lê)
- [ ] Sidebar highlight ativo para página atual
- [ ] Sem 404s ou erros console
