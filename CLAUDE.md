# TBO OS â€” Claude Code Memory

## Stack
- Next.js 14 (App Router) + TypeScript strict + React Query + shadcn/ui + Tailwind CSS
- Supabase (PostgreSQL + RLS + Edge Functions + Realtime)
- Vercel deploy
- Auth: Supabase Auth (Login Google) com RBAC
- Integracoes: OMIE (ERP), RD Station (CRM), Fireflies (Transcricao)

## Arquitetura
- 7 grupos modulares: Dashboard, Estrategia, Execucao, Receita & Caixa, Pessoas, Cultura & Governanca, Intelligence
- 4 roles RBAC: founder > diretoria > lider > colaborador
- Dashboard dinamico por role (4 views distintas)
- Drag & Drop universal em todo modulo/secao/child com regras de secao automaticas
- Tabelas seguem modelo Notion (18 tipos de propriedade, filtros persistentes por view, D&D de colunas)
- Referencia completa: @docs/architecture.md

## Convencoes de Codigo
- TypeScript strict â€” NUNCA usar `any`, preferir `unknown` ou tipo especifico
- React Query para TODO data fetching â€” NUNCA useEffect + useState para fetch
- shadcn/ui para componentes â€” NUNCA HTML puro para o que shadcn resolve
- Zod para validacao de inputs
- Server Components por padrao, Client Components so quando necessario
- Error boundaries em toda rota

## Padroes Obrigatorios
- Persistencia 100% Supabase â€” NUNCA localStorage como fonte de verdade
- RBAC duplo: RBACGuard no frontend + RLS policy no Supabase (SEMPRE ambos)
- Drag & Drop: optimistic update + rollback + Ctrl+Z (undo) + regras de secao destino
- Audit trail: logar alteracoes criticas (quem, quando, o que, antes/depois)
- Loading: skeleton content-aware (reflete layout real, nao spinner generico)
- Empty states: inspiram acao (CTA claro, nao texto triste)
- Error states: mensagem util + proximo passo + botao retry

## Proibicoes
- NUNCA embed/iframe externo â€” tudo nativo
- NUNCA console.log em producao â€” usar logger
- NUNCA commit sem type-check passar
- NUNCA modificar migrations existentes â€” criar nova
- NUNCA confiar apenas no frontend para seguranca â€” RLS obrigatorio
- NUNCA criar componente com 300+ linhas â€” dividir

## Estrutura de Pastas
```
src/
  app/          # App Router pages
  components/   # Shared UI components
  features/     # Feature modules (por grupo modular)
  hooks/        # Custom hooks
  lib/          # Utilities, supabase client, types
  services/     # API/integration layers (OMIE, RD, Fireflies)
```

## Comandos
- `pnpm dev` â€” dev server
- `pnpm build` â€” production build
- `pnpm lint` â€” ESLint + type-check
- `pnpm test` â€” testes

## Agents QA Pipeline
Para auditoria, correcao e validacao do TBO OS, usar o sistema de agentes:
- @docs/agents/auditor-guide.md â€” Auditor (6 camadas de analise)
- @docs/agents/implementor-guide.md â€” Implementor (11 templates + regras globais)
- @docs/agents/validator-guide.md â€” Validator (7 fases + loop de re-implementacao)
- Pipeline completo: Auditor -> Implementor -> Validator (+ Scorer opcional)
- Trigger: "auditar", "pipeline QA", "health score", "checar regras globais"
