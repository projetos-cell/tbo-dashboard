-- Migration 014: Adicionar colunas current_phase e updated_at no omie_sync_log
--
-- O route.ts reescrito usa updateSyncProgress() para reportar progresso
-- incremental de cada fase. current_phase armazena a fase atual,
-- updated_at é atualizado a cada chamada de progresso.

ALTER TABLE omie_sync_log
    ADD COLUMN IF NOT EXISTS current_phase TEXT;

ALTER TABLE omie_sync_log
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
