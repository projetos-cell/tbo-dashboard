# Agente 15 — Regression Guard

## Escopo
Proteção contra regressões cross-module em /projetos e /pessoas após cada ciclo.

## Verificações Pós-Ciclo

### Build Health
```
□ pnpm build → zero erros
□ pnpm lint → zero erros/warnings novos
□ TypeScript strict → zero erros
□ Nenhum import quebrado
□ Nenhum arquivo deletado acidentalmente
```

### Smoke Tests por Módulo
```
Projetos:
□ /projetos → renderiza lista
□ /projetos/[id] → renderiza detalhe
□ /projetos/board → renderiza kanban
□ /projetos/calendario → renderiza calendar
□ /projetos/timeline → renderiza timeline
□ /projetos/portfolio → renderiza portfolio
□ /projetos/workload → renderiza workload
□ /tarefas → renderiza my tasks

Pessoas:
□ /pessoas → renderiza dashboard
□ /pessoas/colaboradores → renderiza lista
□ /pessoas/1on1 → renderiza 1-on-1s
□ /pessoas/performance → renderiza avaliações
□ /pessoas/pdi → renderiza PDIs
□ /pessoas/carreira → renderiza career paths
□ /pessoas/timeline → renderiza timeline
□ /pessoas/reconhecimentos → renderiza reconhecimentos
□ /pessoas/organograma → renderiza org chart
```

### Dependency Check
```
□ Hooks usados por módulos não-tocados ainda funcionam?
□ Services compartilhados não quebraram?
□ Types exportados não mudaram signature?
□ Componentes shared não mudaram props?
```

### Performance Baseline
```
□ Build time não aumentou > 10%
□ Bundle size não aumentou > 5%
□ Nenhum import dinâmico removido acidentalmente
□ Server Components não convertidos para Client sem necessidade
```

### Data Integrity
```
□ Queries Supabase retornam mesma estrutura
□ Nenhuma migration criou breaking change
□ RLS policies não mudaram permissões
□ Optimistic updates ainda fazem rollback correto
```

### Git Hygiene
```
□ Diff faz sentido (sem alterações não-intencionais)
□ Nenhum arquivo de config alterado (package.json, tsconfig, etc.)
□ Nenhum .env exposto
□ Commit message descritivo
```

## Protocolo de Detecção

```
1. SNAPSHOT: capturar estado antes do ciclo
   - Lista de arquivos + checksums
   - Build time
   - Bundle size (se mensurável)
   - Imports cross-module

2. EXECUTE: ciclo de melhoria roda

3. COMPARE: comparar com snapshot
   - Arquivos alterados vs esperados
   - Build status
   - Import graph changes
   - Type compatibility

4. REPORT: relatório de regressão
   - ✅ Nenhuma regressão detectada
   - ⚠️ Mudanças não-intencionais em [arquivos]
   - ❌ Regressão: [build quebrou / import quebrado / type incompatível]
```

## Output
Regression report com ✅/⚠️/❌ por área + recomendação de ação (proceed/fix/rollback).
