# Cultura — Relatório de Melhoria Ciclo 2
**Data:** 2026-03-14
**Branch:** claude/improve-20260314-1407

---

## Diagnóstico

### Módulo auditado
`frontend/app/(auth)/cultura/` — 14 páginas + `frontend/features/cultura/` (services, hooks, components)

### Páginas presentes
- `/cultura` — overview
- `/cultura/pilares`, `/cultura/valores`, `/cultura/documentos`, `/cultura/manual`
- `/cultura/rituais`, `/cultura/politicas`, `/cultura/politicas/[slug]`
- `/cultura/reconhecimentos`, `/cultura/recompensas`
- `/cultura/academy`, `/cultura/bau-criativo`, `/cultura/ferramentas`
- `/cultura/analytics`

---

## Problemas Encontrados

### P0 — Botão/ação quebrada
1. **BauContributeDialog**: `<Form>` usado incorrectamente — padrão inválido para o componente customizado do projeto.
2. **BauCriativoPage**: referências usavam `SEED_REFERENCES` hardcoded, nunca chamava o Supabase mesmo com service já implementado.

### P1 — CRUD / hook faltando
3. **useBauReferences inexistente**: service `getBauReferencesBySubcategory` existia mas não havia hook React Query correspondente.

### P2 — Sem feedback/loading
4. **AcademyPage — "Já concluído"**: botão sem estado `disabled` nem texto de loading durante mutation.
5. **FerramentasPage — EmptyState**: `<div>` genérico em vez do componente `EmptyState` padrão do sistema.

### P1 — Validação manual inconsistente
6. **RitualFormDialog**: único dialog do módulo usando `useState + errors` manual em vez de `react-hook-form + zod`.

---

## Implementações (6 itens)

### 1. Hook `useBauReferences` — `features/cultura/hooks/use-bau-criativo.ts`
- Novo hook com React Query, ativado apenas quando card expandido (lazy, evita N+1)
- Retry inteligente: não tenta novamente se tabela não existir no Supabase
- `useCreateBauReference` invalidates a query da subcategoria após submit

### 2. Fix `BauContributeDialog` — `features/cultura/components/bau-contribute-dialog.tsx`
- Corrigido para `<Form form={form} onSubmit={...}>` — padrão correto do componente

### 3. BauCriativoPage com Supabase real — `app/(auth)/cultura/bau-criativo/page.tsx`
- Removido `SEED_REFERENCES` hardcoded
- `SubcategoryCard` inline com `useBauReferences` (lazy-load por expansão)
- Skeleton loading, empty state por subcategoria, EmptyState com CTA

### 4. `RitualFormDialog` migrado — `features/cultura/components/ritual-form-dialog.tsx`
- Reescrito com `useForm` + `zodResolver`
- Mensagens inline via `FormMessage`, reset automático
- Compatível com Zod v4 (`z.number()` + `parseInt` no onChange)

### 5. Loading state no Academy — `app/(auth)/cultura/academy/page.tsx`
- Prop `isCompleting` no `ModuleCard`
- Botão "Já concluído": `disabled` durante mutation, texto "Salvando..."
- Granular por módulo via `markComplete.variables === mod.id`

### 6. EmptyState correto em Ferramentas — `app/(auth)/cultura/ferramentas/page.tsx`
- `EmptyState` com CTA "Limpar busca" para busca sem resultado
- `EmptyState` genérico para lista vazia

---

## Validação

```
npx tsc --noEmit — 0 erros
```

---

## Arquivos Modificados

| Arquivo | Tipo |
|---|---|
| `features/cultura/hooks/use-bau-criativo.ts` | Novo hook + fix invalidação |
| `features/cultura/components/bau-contribute-dialog.tsx` | Fix Form tag |
| `features/cultura/components/ritual-form-dialog.tsx` | Migração react-hook-form |
| `app/(auth)/cultura/bau-criativo/page.tsx` | Supabase query real + EmptyState |
| `app/(auth)/cultura/academy/page.tsx` | Loading state no botão |
| `app/(auth)/cultura/ferramentas/page.tsx` | EmptyState correto |

---

## Pendências para Próximo Ciclo

- **P1**: Admin view para aprovar/rejeitar referências do Baú Criativo (moderação `bau_references` com status `pending`)
- **P2**: RituaisPage — mostrar próxima ocorrência baseado na frequência
- **P3**: AcademyPage — expor `useMarkModuleIncomplete` na UI (hook existe mas não está conectado)
- **P3**: FerramentasPage — link direto por ferramenta (não só credenciais)
- **P2**: AnalyticsPage — seletor de período para gráfico de tendência de reconhecimentos
