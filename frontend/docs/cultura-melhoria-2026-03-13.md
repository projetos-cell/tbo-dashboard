# Cultura — Melhoria Contínua 2026-03-13

## Diagnóstico

### Módulo Cultura — Escopo analisado
- 12 arquivos de página (app router)
- 28 componentes em features/cultura/components
- 7 hooks em features/cultura/hooks
- 5 services em features/cultura/services

### Problemas encontrados por prioridade

**P0 (broken):** Nenhum. O módulo tem estrutura sólida com CRUD completo, D&D com undo, React Query, toasts e error states.

**P1 (missing core UX):**
1. `RitualFormDialog` — Zod validava silenciosamente: campos inválidos (nome vazio, duração < 5min) não exibiam mensagem de erro inline. Submit era bloqueado mas sem feedback ao usuário.
2. `pilares/page.tsx` — `handleSave` não fechava o form após salvar com sucesso (`setShowForm(false)` ausente). Form permanecia aberto mesmo após criação/edição bem-sucedida.
3. `valores/page.tsx` — Mesmo problema de `pilares/page.tsx`: form não fechava após salvar.

**P2 (UX faltando):**
4. `RecognitionFeedCard` — borda esquerda hardcoded como `#22c55e` (verde) independente do valor TBO reconhecido. Não havia conexão visual com o valor (ownership=amber, excelência=purple, colaboração=blue, etc).
5. `analytics/page.tsx` — `MetricCard` exibia `0` durante loading em vez de skeleton. Estado de carregamento sem feedback adequado.

**P3 (polish, não implementado neste ciclo):**
- Catálogo de recompensas estático (rewards-catalog.ts) vs dados Supabase — decisão de design intencional
- `recognition-ranking.tsx` sem loading state específico
- Formulário de políticas sem validação em tempo real (apenas no submit)

## Implementado

### 1. RitualFormDialog — Erros inline de validação
**Arquivo:** `frontend/features/cultura/components/ritual-form-dialog.tsx`
- Adicionado tipo `RitualFormErrors` para tipagem strict dos erros
- Adicionado estado `errors: RitualFormErrors`
- `handleSubmit` agora extrai e armazena erros por campo (alinhado ao padrão de `recognition-form.tsx`)
- Campos `name` e `duration_minutes` exibem mensagem de erro inline em vermelho
- Erros são limpos ao `onOpenChange` e ao editar o campo específico

### 2. pilares/page.tsx — Fechamento do form após salvar
**Arquivo:** `frontend/app/(auth)/cultura/pilares/page.tsx`
- Adicionado `setShowForm(false)` e `setEditingItem(null)` no bloco `try` do `handleSave`
- Form fecha automaticamente após criação ou edição bem-sucedida

### 3. valores/page.tsx — Fechamento do form após salvar
**Arquivo:** `frontend/app/(auth)/cultura/valores/page.tsx`
- Mesmo fix de `pilares/page.tsx`
- `setShowForm(false)` e `setEditingItem(null)` adicionados ao sucesso do mutate

### 4. RecognitionFeedCard — Cor da borda dinâmica por valor TBO
**Arquivo:** `frontend/features/cultura/components/recognition-feed-card.tsx`
- Importado `TBO_VALUES` de `@/lib/constants`
- `borderLeftColor` usa `TBO_VALUES.find(v => v.id === recognition.value_id)?.color ?? "#22c55e"`
- Resultado: borda amber para Ownership, purple para Excelência, blue para Colaboração

### 5. analytics/page.tsx — Skeleton nas MetricCards durante loading
**Arquivo:** `frontend/app/(auth)/cultura/analytics/page.tsx`
- Importado `Skeleton` de `@/components/ui/skeleton`
- `MetricCard` recebe nova prop `isLoading?: boolean`
- Quando loading: exibe skeletons no lugar dos números
- Consistente com o padrão de loading de outras páginas do sistema

## Próximas prioridades

1. **Rituals — filtro UI** para ativo/inativo para colaboradores/líderes
2. **Políticas — validação em tempo real** dos campos (título, resumo)
3. **Recognition — paginação** no feed (limit: 50, sem lazy loading)
4. **Analytics — gráfico temporal** de reconhecimentos por mês
5. **Manual — busca/filtro** de páginas
6. **Reconhecimentos — toast dedicado** ao receber reconhecimento via Realtime

## Build status: OK

- `tsc --noEmit`: passou sem erros
- `pnpm build`: compilação bem-sucedida com Turbopack (`Compiled successfully`)
- 5 arquivos modificados, 0 arquivos criados
