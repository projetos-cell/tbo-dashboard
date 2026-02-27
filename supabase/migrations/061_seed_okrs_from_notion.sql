-- ============================================================================
-- Migration 061: Seed OKR data from Notion (OKRs TBO 2026)
-- Source: https://www.notion.so/OKRs-TBO-2026-2e0b27ff29e38020bf63e8cf9b3714d5
-- 9 Objectives + 21 Key Results importados do Notion
-- Idempotente: verifica se ja existem dados antes de inserir.
-- ============================================================================

DO $$
DECLARE
  _tid UUID := '89080d1a-bc79-4c3f-8fce-20aabc561c0d';
  _marco UUID := '46594a5e-564f-45ad-acef-35bc3706d117';
  _ruy UUID := 'c81b9468-9ec3-414d-a5d6-03dc6a061f73';
  _obj UUID;
  _count INT;
BEGIN
  -- Guard: skip if data already exists
  SELECT COUNT(*) INTO _count FROM okr_objectives WHERE tenant_id = _tid;
  IF _count > 0 THEN
    RAISE NOTICE 'OKR data already exists (% objectives). Skipping seed.', _count;
    RETURN;
  END IF;

  -- ========== OBJ 1: Fortalecer Cultura & Gestão ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Fortalecer Cultura & Gestão', 'Responsável: Todos | Trimestres: T1-T4 2026', 'company', '2026', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Realizar 12 All Hands mensais', 'number', 0, 0, 12, 'reuniões', 'on_track', 'active'),
    (_tid, _obj, 'Realizar 4 Workshops por trimestre', 'number', 0, 0, 4, 'workshops', 'on_track', 'active'),
    (_tid, _obj, 'Ritual Semanal Branding com 40 reuniões', 'number', 0, 3, 40, 'reuniões', 'on_track', 'active'),
    (_tid, _obj, 'Ritual Semanal Marketing com 40 reuniões', 'number', 0, 3, 40, 'reuniões', 'on_track', 'active'),
    (_tid, _obj, 'Ritual Semanal Digital 3D com 40 reuniões', 'number', 0, 3, 40, 'reuniões', 'on_track', 'active');

  -- ========== OBJ 2: Fortalecer o Ecossistema de Indicações ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Fortalecer o Ecossistema de Indicações', 'Responsável: Todos | Trimestre: T2 2026', 'company', '2026-Q2', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Programa de indicações ativo com 100% dos colaboradores participando', 'percentage', 0, 0, 100, '%', 'on_track', 'active'),
    (_tid, _obj, '5 parceiros ativos no programa de indicações', 'number', 0, 0, 5, 'parceiros', 'on_track', 'active'),
    (_tid, _obj, '5 indicações qualificadas recebidas', 'number', 0, 0, 5, 'indicações', 'on_track', 'active');

  -- ========== OBJ 3: Fortalecer posicionamento marca TBO ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Fortalecer posicionamento marca TBO', 'Responsável: Todos | Trimestre: T1 2026', 'company', '2026-Q1', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Consistência em 7 pontos de contato da marca', 'number', 0, 0, 7, 'pontos', 'on_track', 'active'),
    (_tid, _obj, 'Percepção de valor da marca pelos clientes', 'boolean', 0, 0, 1, NULL, 'on_track', 'active');

  -- ========== OBJ 4: Eficiência IA na produção ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Eficiência IA na produção', 'Responsável: Marco | Trimestres: T1+T2 2026', 'company', '2026-H1', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'KR1A — Branding: 15 jobs com IA integrada', 'number', 8, 8, 15, 'jobs', 'on_track', 'active'),
    (_tid, _obj, 'KR1B — Digital 3D: 15 jobs com IA integrada', 'number', 7, 7, 15, 'jobs', 'on_track', 'active'),
    (_tid, _obj, 'KR1C — Marketing: 15 jobs com IA integrada', 'number', 8, 8, 15, 'jobs', 'on_track', 'active'),
    (_tid, _obj, 'KR2A — Branding: 23 templates padronizados', 'number', 0, 0, 23, 'templates', 'on_track', 'active'),
    (_tid, _obj, 'KR2B — Digital 3D: 10 templates padronizados', 'number', 0, 0, 10, 'templates', 'on_track', 'active'),
    (_tid, _obj, 'KR3C — Marketing: 30 prompts padronizados', 'number', 0, 0, 30, 'prompts', 'on_track', 'active');

  -- ========== OBJ 5: Otimizar Gestão Financeira ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Otimizar Gestão Financeira', 'Responsável: Ruy | Trimestre: T1 2026', 'company', '2026-Q1', 'active', _ruy, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Estruturar fluxo de caixa e controles financeiros', 'boolean', 0, 0, 1, NULL, 'on_track', 'active');

  -- ========== OBJ 6: Priorização da Marca TBO ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Garantir prioridade de marca nos projetos de design', 'Responsável: Todos | Trimestre: T1 2026', 'company', '2026-Q1', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Garantir prioridade marca em 4 projetos-chave', 'number', 0, 2, 4, 'projetos', 'on_track', 'active');

  -- ========== OBJ 7: Ampliar Base de Fornecedores ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Ampliar Base de Fornecedores Qualificados', 'Responsável: Todos | Trimestres: T1-T4 2026', 'company', '2026', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, '30 parceiros/fornecedores mapeados e avaliados', 'number', 0, 0, 30, 'parceiros', 'on_track', 'active');

  -- ========== OBJ 8: 100% Aderência Processos ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, '100% Aderência a Processos e Sistemas', 'Responsável: Marco | Trimestre: T2 2026', 'company', '2026-Q2', 'active', _marco, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Otimizar treinamentos e padronização no Notion', 'boolean', 0, 0, 1, NULL, 'on_track', 'active');

  -- ========== OBJ 9: Profissionalizar Gestão de Pessoas ==========
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress)
  VALUES (_tid, 'Profissionalizar Gestão de Pessoas', 'Responsável: Ruy | Trimestre: T1 2026', 'company', '2026-Q1', 'active', _ruy, 0)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status)
  VALUES
    (_tid, _obj, 'Estruturar plano de carreira e revisar contratos', 'boolean', 0, 0, 1, NULL, 'on_track', 'active');

  RAISE NOTICE 'OKR seed complete: 9 objectives + 21 key results inserted.';
END $$;

-- ============================================================================
-- FIM da Migration 061
-- ============================================================================
