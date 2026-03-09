-- Migration 015: Fix paid_amount for existing transactions
-- Omie's ListarContasPagar/ListarContasReceber don't return valor_pago/valor_recebido.
-- For transactions with status='pago', paid_amount should equal valor_documento (from omie_raw).

UPDATE finance_transactions
SET paid_amount = amount,
    updated_at = now()
WHERE status = 'pago'
  AND (paid_amount IS NULL OR paid_amount = 0)
  AND amount > 0;
