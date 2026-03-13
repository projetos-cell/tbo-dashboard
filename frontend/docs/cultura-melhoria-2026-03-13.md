# Cultura — Pipeline de Melhoria Continua
**Data:** 2026-03-13

---

## Diagnostico

**12 paginas/sub-rotas mapeadas:**
- `/cultura` — overview hub
- `/cultura/pilares` — CRUD completo
- `/cultura/valores` — CRUD completo
- `/cultura/rituais` — CRUD completo com toggle ativo
- `/cultura/politicas` — CRUD completo com filtros e slug detail
- `/cultura/politicas/[slug]` — detail view com form de edicao
- `/cultura/reconhecimentos` — feed, ranking, aprovacao Fireflies
- `/cultura/recompensas` — catalogo tiered + resgates
- `/cultura/documentos` — CRUD completo
- `/cultura/manual` — CRUD completo (list view estilo wiki)
- `/cultura/analytics` — metricas com RBAC diretoria+

**Problemas identificados (8 total):**

### P0 — Broken (2)
1. **Recompensas / aba Admin sem CRUD de recompensas Supabase**: `useCreateReward`, `useUpdateReward`, `useDeleteReward` existiam nos hooks mas a UI nao os usava. O catalogo era 100% hardcoded e a aba "Gerenciar" so mostrava resgates pendentes.
2. **Resgates aprovados sem caminho para "Entregue"**: O status `delivered` existia no backend mas nao havia botao "Marcar Entregue" em nenhuma tela. Resgates aprovados ficavam eternamente em "Aprovado".

### P1 — Missing Core CRUD (1)
3. **Sem form de criacao/edicao de recompensas no catalogo Supabase**: Ausencia de dialog para criar/editar recompensas com validacao Zod.

### P2 — Missing UX (2)
4. **RecognitionForm sem feedback de validacao inline**: O Zod validava internamente mas silenciosamente — o usuario nao recebia feedback sobre qual campo estava errado.
5. **KPI cards de recompensas sem skeleton**: Cards mostravam `0` durante loading em vez de skeleton content-aware.

---

## O que foi implementado

### 1. RedemptionPendingList — Refactor completo
**Arquivo:** `frontend/features/cultura/components/redemption-pending-list.tsx`

- **Botao "Marcar Entregue"** para resgates no status `approved` — fluxo completo pending -> approved -> delivered
- **Separacao visual em 3 cards**: "Aguardando Aprovacao", "Aprovados — Aguardando Entrega", "Historico de Resgates"
- **Historico com status badges** (cor + icone) para todos os resgates
- **EmptyState com CTA** no card de pendentes
- **Prop `onDeliver` opcional** para manter backward compatibility

### 2. RewardFormDialog — Novo componente
**Arquivo:** `frontend/features/cultura/components/reward-form-dialog.tsx`

- Dialog com validacao Zod para criar/editar recompensas no catalogo Supabase
- Campos: nome, descricao, pontos, tipo (select), valor BRL (opcional), toggle ativo/inativo
- Erros inline por campo
- Suporte a modo edicao (pre-populado) e criacao

### 3. Recompensas page — Admin CRUD completo
**Arquivo:** `frontend/app/(auth)/cultura/recompensas/page.tsx`

- **Aba Admin expandida** com duas secoes:
  - "Catalogo de Recompensas (Supabase)" — listagem com DropdownMenu (editar, ativar/desativar, excluir), badge de inativo, ConfirmDialog para exclusao
  - "Resgates" — RedemptionPendingList com `onDeliver` conectado
- **Botao "Nova recompensa"** no header (aparece apenas na aba admin, apenas para canManage)
- **Skeleton nos 4 KPI cards** substituindo o `0` durante loading
- Import de `useRewards`, `useCreateReward`, `useUpdateReward`, `useDeleteReward` do hook existente

### 4. RecognitionForm — Validacao inline
**Arquivo:** `frontend/features/cultura/components/recognition-form.tsx`

- Estado `errors: RecognitionFormErrors` com tipo estrito
- Cada campo mostra erro em vermelho quando invalido
- Campo Select com `border-red-500` quando to_user nao selecionado
- Textarea com `border-red-500` quando mensagem invalida
- Reset dos erros ao fechar o dialog

---

## Proximas prioridades

### P1
- **Recompensas: catalogo Supabase vs hardcoded**: O `RewardsTierCatalog` ainda usa o catalogo hardcoded. Ideal unificar para usar recompensas do Supabase com tiers configurados dinamicamente.
- **Rituais: associacao com reunioes**: Rituais existem como tipos mas nao estao ligados a eventos reais de agenda.

### P2
- **Politicas: notificacao de revisao pendente**: `next_review_at` e exibido mas sem alerta no sidebar quando politicas estao vencidas.
- **Manual: drag-and-drop para reordenar paginas**: `order_index` existe no schema mas sem D&D na UI.

### P3
- **Reconhecimentos: paginacao real**: UI carrega fixo `limit: 50` sem "carregar mais".
- **Politicas [slug]: breadcrumb** faltando.

---

## Build status

```
npx tsc --noEmit: PASSED (0 errors)
```

**Arquivos tocados (4):**
- `frontend/features/cultura/components/redemption-pending-list.tsx`
- `frontend/features/cultura/components/recognition-form.tsx`
- `frontend/features/cultura/components/reward-form-dialog.tsx` (criado)
- `frontend/app/(auth)/cultura/recompensas/page.tsx`
