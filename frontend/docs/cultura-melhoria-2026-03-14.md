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

### Próximas prioridades (para próxima rodada)
1. Valores/Pilares — admin CRUD inline (editar nome/descrição/ícone sem sair da página)
2. Rituais — admin visualização de histórico de ocorrências por ritual
3. Analytics — melhorar gráficos de engajamento por período
4. Reconhecimentos — filtro por valor na tab principal

### Build status: ✅
