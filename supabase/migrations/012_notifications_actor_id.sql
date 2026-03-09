-- Migration 012: Adicionar coluna actor_id na tabela notifications
--
-- PROBLEMA: O código frontend referenciava actor_id mas a coluna não existia.
-- Isso ficou oculto porque types.ts era placeholder. Ao regenerar os types
-- com o schema real, o erro de tipo foi exposto.
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
