-- Add category and source_path columns to contracts table
-- category: equipe, cliente, fornecedor, distrato
-- source_path: original Google Drive path for traceability

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS source_path TEXT;

-- Add constraint for category values
ALTER TABLE contracts
  ADD CONSTRAINT chk_contracts_category
  CHECK (category IS NULL OR category IN ('equipe', 'cliente', 'fornecedor', 'distrato'));

COMMENT ON COLUMN contracts.category IS 'Categoria do contrato: equipe, cliente, fornecedor, distrato';
COMMENT ON COLUMN contracts.source_path IS 'Caminho original do arquivo no Google Drive';
