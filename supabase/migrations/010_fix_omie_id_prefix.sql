-- Migration 010: Prefixar omie_id em finance_transactions para evitar colisão AP/AR
--
-- PROBLEMA: route.ts usava omie_id cru (ex: "12345") tanto para payables quanto
-- receivables. Como a tabela tem UNIQUE(tenant_id, omie_id), IDs iguais colidem
-- e um tipo sobrescreve o outro.
--
-- SOLUÇÃO: Prefixar com payable_ / receivable_ baseado no campo type.
-- Edge function já usava este padrão corretamente.
--
-- REGRA: NUNCA modificar migrations existentes — sempre criar nova

-- Prefixar payables (type = 'despesa') que ainda não têm prefixo
UPDATE finance_transactions
SET omie_id = 'payable_' || omie_id
WHERE omie_id IS NOT NULL
  AND type = 'despesa'
  AND omie_id NOT LIKE 'payable_%'
  AND omie_id NOT LIKE 'receivable_%';

-- Prefixar receivables (type = 'receita') que ainda não têm prefixo
UPDATE finance_transactions
SET omie_id = 'receivable_' || omie_id
WHERE omie_id IS NOT NULL
  AND type = 'receita'
  AND omie_id NOT LIKE 'payable_%'
  AND omie_id NOT LIKE 'receivable_%';

-- Transferências mantêm omie_id como está (raro via Omie)
