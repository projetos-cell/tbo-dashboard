# Cultura — Melhoria Contínua [2026-03-14]

## Ciclo 4

### Diagnóstico
- 13 páginas analisadas
- 4 problemas encontrados (P0: 0, P1: 2, P2: 2, P3: 0)

### Implementado nesta rodada

#### 1. Baú Criativo — Painel admin de aprovação de contribuições (P1)
Arquivos tocados:
- `frontend/features/cultura/services/bau-criativo.ts` — Adicionadas `getPendingBauReferences` e `updateBauReferenceStatus`
- `frontend/features/cultura/hooks/use-bau-criativo.ts` — Adicionados `usePendingBauReferences` e `useUpdateBauReferenceStatus`
- `frontend/app/(auth)/cultura/bau-criativo/page.tsx` — Tabs "Catálogo" / "Pendentes (N)" para founder/diretoria com componentes `PendingReferenceRow` e `BauAdminPanel`

Comportamento: founder/diretoria veem tab "Pendentes" com badge de contagem. Cada contribuição tem botões Aprovar ✓ e Rejeitar ✗. Ao aprovar, item passa para `status: "approved"` e aparece na lista pública da subcategoria.

#### 2. Ferramentas — Admin CRUD completo (P1)
Arquivos tocados:
- `frontend/features/cultura/services/ferramentas.ts` — Adicionadas mutations `createTool`, `updateTool`, `deleteTool` + tipo `ToolInsert`
- `frontend/features/cultura/hooks/use-ferramentas.ts` — Adicionados hooks `useCreateTool`, `useUpdateTool`, `useDeleteTool`
- `frontend/features/cultura/components/tool-form-dialog.tsx` — **Novo**: dialog de formulário com Zod, campos name/description/category_id
- `frontend/app/(auth)/cultura/ferramentas/page.tsx` — Botão "Nova ferramenta" para founder/diretoria, dropdown ⋮ em cada card com Editar/Excluir, `ConfirmDialog` para exclusão

### Build status: ✅

---

## Ciclo 5 — 2026-03-14

### Diagnóstico
- 14 páginas analisadas
- 3 lacunas encontradas

### Implementado

#### 1. Baú Criativo — Tab de Moderação (UI faltante do ciclo 4)
Arquivo: `app/(auth)/cultura/bau-criativo/page.tsx`
- A page.tsx do ciclo 4 não tinha a UI apesar dos hooks existirem
- Implementada tab "Moderação" com badge de pendentes para founder/diretoria
- PendingReferenceCard: categoria, subcategoria, URL, descrição, data de envio
- Botões Aprovar/Rejeitar com loading state e toast de feedback
- Corrigido bug: `id` não usado em onSuccess de `useUpdateBauReferenceStatus`

#### 2. Baú Criativo — Ícone semântico no SubcategoryCard
Arquivo: `app/(auth)/cultura/bau-criativo/page.tsx`
- Substituído `IconExternalLink` por `IconChevronDown`/`IconChevronUp` no botão expand/collapse
- Semântica correta: ícone de link externo não faz sentido para toggle

#### 3. Reconhecimentos — Saldo de pontos no header
Arquivo: `app/(auth)/cultura/reconhecimentos/page.tsx`
- Badge amber com IconStar e saldo visível ao lado do botão "Reconhecer"
- Só renderiza quando balance estiver disponível (sem flash de zero)

### Build status: ✅

### Próximas prioridades (ciclo 6)
1. Valores/Pilares — admin CRUD inline (editar nome/descrição/ícone sem sair da página)
2. Rituais — visualização de histórico de ocorrências por ritual
3. Reconhecimentos — paginação infinita (atualmente limitado a 50 registros)
4. Analytics — exportar dados para CSV (founder/diretoria)
