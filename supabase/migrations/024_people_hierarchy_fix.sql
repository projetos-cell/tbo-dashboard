-- ============================================================================
-- Migration 024: Fix hierarquia manager_id + salários reais + cargos
-- TBO OS — People Module P3
-- Executada em: 2026-02-21
-- ============================================================================

-- ── Co-CEOs (sem gestor) ──
-- Marco = Diretor Criativo & Operações
-- Ruy = Diretor Comercial & Novos Negócios
UPDATE profiles SET cargo = 'Diretor Criativo & Operações', manager_id = NULL
  WHERE id = '46594a5e-564f-45ad-acef-35bc3706d117';
UPDATE profiles SET cargo = 'Diretor Comercial & Novos Negócios', manager_id = NULL, bu = 'Vendas'
  WHERE id = 'c81b9468-9ec3-414d-a5d6-03dc6a061f73';

-- ── Hierarquia manager_id ──
-- Celso → reporta a Nelson (Branding)
UPDATE profiles SET manager_id = '9919855f-0692-424a-bd91-19617fc89dc8'
  WHERE id = '44ed986f-8cc8-4123-9b76-890242a700ba';
-- Duda → reporta a Nathália (Digital 3D)
UPDATE profiles SET manager_id = 'd3783b0b-3bd6-492e-9b8f-b0cc8c6c235c'
  WHERE id = '256c8ed6-7ffd-438a-beae-4b7a302343c7';
-- Tiago → reporta a Nathália (Digital 3D)
UPDATE profiles SET manager_id = 'd3783b0b-3bd6-492e-9b8f-b0cc8c6c235c'
  WHERE id = '24b3d5f9-63a0-4a69-988b-feb87ea3daaa';
-- Lucca → reporta a Rafa (Marketing)
UPDATE profiles SET manager_id = '044e983c-bb73-4db0-8d63-68ee2bc91ec8'
  WHERE id = 'e1dcb101-7c51-493a-860c-d6eac1bacc6e';
-- Nelson → reporta a Marco (PO Branding)
UPDATE profiles SET manager_id = '46594a5e-564f-45ad-acef-35bc3706d117'
  WHERE id = '9919855f-0692-424a-bd91-19617fc89dc8';
-- Nathália → reporta a Marco (PO Digital 3D)
UPDATE profiles SET manager_id = '46594a5e-564f-45ad-acef-35bc3706d117'
  WHERE id = 'd3783b0b-3bd6-492e-9b8f-b0cc8c6c235c';
-- Rafa → reporta a Marco (Marketing)
UPDATE profiles SET manager_id = '46594a5e-564f-45ad-acef-35bc3706d117'
  WHERE id = '044e983c-bb73-4db0-8d63-68ee2bc91ec8';
-- Gustavo → reporta a Ruy (Comercial)
UPDATE profiles SET manager_id = 'c81b9468-9ec3-414d-a5d6-03dc6a061f73'
  WHERE id = '9b8ef924-0152-4568-93f0-ebc4408c804b';
-- Carol → reporta a Ruy (Pós Vendas)
UPDATE profiles SET manager_id = 'c81b9468-9ec3-414d-a5d6-03dc6a061f73'
  WHERE id = '3232ffc4-ba12-4a15-82a2-3db8b8ec926d';

-- ── Salários reais (PJ mensal) ──
UPDATE profiles SET salary_pj = 12000.00 WHERE username = 'ruy';
UPDATE profiles SET salary_pj = 12000.00 WHERE username = 'marco';
UPDATE profiles SET salary_pj = 4950.00 WHERE username = 'rafa';
UPDATE profiles SET salary_pj = 3000.00 WHERE username = 'lucca';
UPDATE profiles SET salary_pj = 5500.00 WHERE username = 'nelson';
UPDATE profiles SET salary_pj = 2150.00 WHERE username = 'celso';
UPDATE profiles SET salary_pj = 7000.00 WHERE username = 'nath';
UPDATE profiles SET salary_pj = 4300.00 WHERE username = 'tiago';
UPDATE profiles SET salary_pj = 3300.00 WHERE username = 'duda';
UPDATE profiles SET salary_pj = 8200.00 WHERE username = 'carol';
UPDATE profiles SET salary_pj = 2000.00 WHERE username = 'gustavo';

-- ── Cargos atualizados ──
UPDATE profiles SET cargo = 'Social Media' WHERE username = 'rafa';
UPDATE profiles SET cargo = 'Analista de Marketing' WHERE username = 'lucca';
UPDATE profiles SET cargo = 'Artista 3D Pleno' WHERE username = 'tiago';
UPDATE profiles SET cargo = 'Artista 3D Junior' WHERE username = 'duda';
UPDATE profiles SET cargo = 'Assistente' WHERE username = 'celso';
UPDATE profiles SET cargo = 'Atendimento' WHERE username = 'carol';

-- ============================================================================
-- FIM da Migration 024
-- ============================================================================
