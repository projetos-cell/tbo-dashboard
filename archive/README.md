# Archive — TBO OS

Pasta de arquivos legados movidos durante a refatoração enterprise v3.0.

**Estes arquivos NÃO são carregados em produção.**

## Conteúdo

### `schema/`
SQL schemas duplicados que existiam em múltiplos locais.
Fonte da verdade agora: `supabase/migrations/`

### `legacy-enhancements/`
Módulos de enhancement que foram incorporados aos módulos principais.

### `legacy-data/`
Arquivos de dados estáticos que foram migrados para Supabase.

### `migrate.html`
Página standalone de migração com anon key hardcoded.
Removida do deploy por segurança (M5).

## Quando deletar
Após validação completa da v3.0 em produção (mínimo 30 dias), estes
arquivos podem ser removidos com segurança.
