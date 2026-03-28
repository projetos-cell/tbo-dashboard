# Agente 14 — Data Contracts (Cross-Module)

## Escopo
Alinhamento entre tipos TypeScript e schema Supabase em /projetos e /pessoas.

## Verificações

### Type Safety
```
□ Tipos gerados com `supabase gen types` estão atualizados?
□ Services usam Database types (não `any`)?
□ Hooks retornam tipos corretos?
□ Componentes recebem props tipadas?
□ Queries retornam tipos narrowed (não `any[]`)?
```

### Ocorrências Conhecidas de `any`
```
Projetos:
- custom-fields.ts (3x `any`) — CORRIGIR
- project-properties.ts (1x `any`) — CORRIGIR

Pessoas:
- Nenhuma detectada ✅
```

### Schema Alignment
```
□ Tipos de projeto (status, priority, BU) alinhados com enum do DB?
□ Tipos de task (status, priority) alinhados com enum do DB?
□ Tipos de people (status, role) alinhados com enum do DB?
□ Tipos de performance (skill scores, categories) alinhados?
□ Tipos de career (levels, nucleus) alinhados com constants?
□ Tipos de PDI (status, goal status) alinhados?
□ Tipos de 1-on-1 (status, frequency) alinhados?
```

### Null Safety
```
□ Campos nullable do DB tratados no frontend?
□ Optional chaining (?) onde necessário?
□ Default values para campos opcionais?
□ Zod schemas validam nullability?
```

### Query Contracts
```
□ Select queries pedem apenas campos necessários (não select('*'))?
□ Joins são tipados corretamente?
□ RPC calls têm tipos de retorno definidos?
□ Paginação (range/limit) tem tipos?
□ Filtros são type-safe?
```

### Migration Alignment
```
□ Migrations recentes refletem nos types?
□ Nenhuma migration modifica migration existente?
□ Foreign keys e constraints estão nas types?
□ Índices para queries frequentes existem?
```

## Output
Type safety score (0-100) + lista de `any` para eliminar + schema mismatches.
