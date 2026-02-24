-- Migration 051: Remove sidebar pages that are no longer needed
-- Soft-delete "Meu Titulo Principal" and "Biblioteca de Abordagens" from pages table

DO $$
BEGIN
  UPDATE pages SET is_deleted = true, updated_at = now()
  WHERE id IN (
    '89fef189-8d06-417f-a045-5d86fdcbdc62',
    '20b9741f-a1ae-40ed-9b31-42dc8351af85'
  )
  AND is_deleted = false;

  RAISE NOTICE '[051] Soft-deleted sidebar pages: Meu Titulo Principal, Biblioteca de Abordagens';
END $$;
