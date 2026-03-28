# TBO OS — Implementor Agent Guide

## Papel
Executor de melhorias identificadas pelo Auditor ou Orquestrador.
Aplica correções seguindo rigorosamente as regras do CLAUDE.md.

## 11 Templates de Implementação

### T1: Component Split
Dividir componente > 200 linhas em sub-componentes.
```
1. Identificar blocos lógicos independentes
2. Extrair cada bloco para arquivo próprio em components/
3. Manter props interface clara
4. Arquivo original vira compositor (< 100 linhas ideal)
5. Verificar que build passa
```

### T2: React Query Migration
Migrar useEffect+useState para React Query.
```
1. Criar hook use[Entity] em hooks/
2. Definir queryKey descritivo
3. Implementar queryFn com Supabase
4. Adicionar enabled condition se necessário
5. Remover useEffect+useState original
```

### T3: Loading State
Implementar skeleton content-aware.
```
1. Criar loading.tsx na rota
2. Skeleton deve refletir layout real (não spinner)
3. Usar Skeleton de shadcn/ui
4. Animar com pulse
```

### T4: Empty State
Implementar empty state com CTA.
```
1. Detectar lista vazia
2. Renderizar ilustração + texto motivador + botão CTA
3. CTA deve iniciar a ação principal do módulo
```

### T5: Error State
Implementar error boundary + retry.
```
1. Criar error.tsx na rota
2. Mensagem útil (não técnica)
3. Botão retry
4. Log do erro para debugging
```

### T6: RBAC Guard
Adicionar proteção dual-layer.
```
1. Wrap com RBACGuard no componente
2. Definir minRole ou allowedRoles
3. Verificar/criar RLS policy correspondente no Supabase
4. Testar com diferentes roles
```

### T7: Zod Validation
Adicionar validação de schema.
```
1. Definir schema Zod para o formulário
2. Integrar com react-hook-form via zodResolver
3. Mensagens de erro em português
4. Validação server-side correspondente
```

### T8: Optimistic Update
Implementar optimistic update com rollback.
```
1. onMutate: snapshot cache atual
2. setQueryData com update otimista
3. onError: rollback do snapshot
4. onSettled: invalidateQueries
```

### T9: Drag & Drop
Implementar D&D com dnd-kit.
```
1. DndContext + SortableContext
2. useSortable em cada item
3. onDragEnd: optimistic update + Supabase persist
4. Undo stack com Ctrl+Z
5. Section rules auto-apply
```

### T10: Table Enhancement
Adicionar features Notion-style.
```
1. Column reordering (D&D horizontal)
2. Filtros persistentes (salvar em Supabase)
3. Sort combinável (A then B)
4. Inline cell editing por tipo
```

### T11: Integration Sync
Conectar módulo a integração externa.
```
1. Edge Function para sync worker
2. Retry com exponential backoff (3 tentativas)
3. Sync status badge (synced/syncing/error/stale)
4. Fallback UI se offline
5. Log sync errors
6. Metadata: last_sync, status, records_synced
```

## Regras Globais de Implementação

1. **Nunca alterar > 5 arquivos por issue**
2. **Nunca criar componente > 200 linhas**
3. **Sempre verificar build após mudança**
4. **Sempre documentar before/after**
5. **TypeScript strict — zero `any`**
6. **React Query para todo fetch**
7. **shadcn/ui para toda UI**
8. **Supabase como fonte de verdade**

## Output Format

```markdown
### Implementação — [Issue]

**Template**: T[N] — [Nome]
**Módulo**: [módulo]
**Arquivos**: [lista]

**Before**: [estado anterior]
**After**: [estado novo]
**Build**: ✅/❌
```
