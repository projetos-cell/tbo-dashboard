-- G4: Adicionar FK bank_account_id em finance_transactions
-- Migration 008: Liga transactions às contas bancárias via UUID (além do campo texto legado)
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova
-- Autor: Claude (omie-fix G4)
-- Data: 2026-03-09

-- Manter coluna bank_account TEXT existente por retrocompatibilidade (não dropar).
-- Adicionar bank_account_id UUID FK para lookups eficientes e integridade referencial.

ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS bank_account_id UUID
    REFERENCES finance_bank_accounts(id) ON DELETE SET NULL;

COMMENT ON COLUMN finance_transactions.bank_account_id IS
  'FK para finance_bank_accounts. Preenchida pelo omie-sync a partir de nCodContaCorrente. '
  'A coluna bank_account TEXT legada é mantida para retrocompatibilidade.';

CREATE INDEX IF NOT EXISTS idx_finance_transactions_bank_account_id
  ON finance_transactions(bank_account_id)
  WHERE bank_account_id IS NOT NULL;
