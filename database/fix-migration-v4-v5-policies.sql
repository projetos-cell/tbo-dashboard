-- ============================================================================
-- FIX: Dropar policies existentes antes de recriar (v4 financeiro + v5 academy)
-- Executar ANTES de re-executar migration-v4 e migration-v5
-- Seguro: DROP IF EXISTS nao da erro se nao existir
-- ============================================================================

-- ── v4 Financeiro — DROP existing policies ──────────────────────────────────
DROP POLICY IF EXISTS "fin_categories_read" ON fin_categories;
DROP POLICY IF EXISTS "fin_cost_centers_read" ON fin_cost_centers;
DROP POLICY IF EXISTS "fin_vendors_read" ON fin_vendors;
DROP POLICY IF EXISTS "fin_clients_read" ON fin_clients;
DROP POLICY IF EXISTS "fin_transactions_read" ON fin_transactions;
DROP POLICY IF EXISTS "fin_invoices_read" ON fin_invoices;
DROP POLICY IF EXISTS "fin_receivables_read" ON fin_receivables;
DROP POLICY IF EXISTS "fin_payables_read" ON fin_payables;
DROP POLICY IF EXISTS "bank_imports_read" ON bank_imports;
DROP POLICY IF EXISTS "bank_transactions_read" ON bank_transactions;
DROP POLICY IF EXISTS "reconciliation_rules_read" ON reconciliation_rules;
DROP POLICY IF EXISTS "reconciliation_audit_read" ON reconciliation_audit;
DROP POLICY IF EXISTS "fin_transactions_insert" ON fin_transactions;
DROP POLICY IF EXISTS "fin_transactions_update" ON fin_transactions;
DROP POLICY IF EXISTS "fin_receivables_insert" ON fin_receivables;
DROP POLICY IF EXISTS "fin_receivables_update" ON fin_receivables;
DROP POLICY IF EXISTS "fin_payables_insert" ON fin_payables;
DROP POLICY IF EXISTS "fin_payables_update" ON fin_payables;
DROP POLICY IF EXISTS "bank_imports_insert" ON bank_imports;
DROP POLICY IF EXISTS "bank_transactions_insert" ON bank_transactions;
DROP POLICY IF EXISTS "reconciliation_rules_insert" ON reconciliation_rules;
DROP POLICY IF EXISTS "reconciliation_rules_update" ON reconciliation_rules;
DROP POLICY IF EXISTS "reconciliation_audit_insert" ON reconciliation_audit;

-- ── v5 Academy — DROP existing policies ─────────────────────────────────────
DROP POLICY IF EXISTS "academy_courses_read" ON academy_courses;
DROP POLICY IF EXISTS "academy_lessons_read" ON academy_lessons;
DROP POLICY IF EXISTS "academy_assets_read" ON academy_assets;
DROP POLICY IF EXISTS "academy_enrollments_read" ON academy_enrollments;
DROP POLICY IF EXISTS "academy_enrollments_insert" ON academy_enrollments;
DROP POLICY IF EXISTS "academy_progress_read" ON academy_progress;
DROP POLICY IF EXISTS "academy_progress_upsert" ON academy_progress;
DROP POLICY IF EXISTS "academy_progress_update" ON academy_progress;
DROP POLICY IF EXISTS "academy_certificates_read" ON academy_certificates;
DROP POLICY IF EXISTS "market_research_read" ON market_research;
DROP POLICY IF EXISTS "market_research_insert" ON market_research;
DROP POLICY IF EXISTS "market_research_update" ON market_research;
DROP POLICY IF EXISTS "market_sources_read" ON market_sources;

-- Pronto! Agora re-execute migration-v4-financeiro.sql e migration-v5-academy.sql
