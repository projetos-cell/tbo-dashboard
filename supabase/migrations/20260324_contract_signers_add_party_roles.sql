-- Migration: Add contractor/contractee roles to contract_signers
-- Sprint 1: Resolve feedback about missing Contratante/Contratado labels

-- The role column is text (not enum), so we just need to ensure the check constraint accepts new values
-- First check if there's an existing constraint
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'contract_signers_role_check'
    AND table_name = 'contract_signers'
  ) THEN
    ALTER TABLE contract_signers DROP CONSTRAINT contract_signers_role_check;
  END IF;
END $$;

-- Add updated check constraint with new roles
ALTER TABLE contract_signers
  ADD CONSTRAINT contract_signers_role_check
  CHECK (role IN ('contractor', 'contractee', 'signer', 'witness', 'approver'));

-- Add comment for documentation
COMMENT ON COLUMN contract_signers.role IS
  'Party role: contractor (Contratante), contractee (Contratado), signer (Signatario adicional), witness (Testemunha), approver (Aprovador)';
