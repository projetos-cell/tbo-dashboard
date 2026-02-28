-- ============================================================================
-- Migration 068: Re-seed OKR data from Notion (OKRs TBO 2026) — Complete
-- Source: https://www.notion.so/OKRs-TBO-2026-2e0b27ff29e38020bf63e8cf9b3714d5
-- Replaces partial seed from 061 with complete 14 Objectives + 33 Key Results
-- Linked to 4 proper quarterly cycles (T1-T4 2026)
-- ============================================================================

DO $$
DECLARE
  _tid UUID := '89080d1a-bc79-4c3f-8fce-20aabc561c0d';
  _marco UUID := '46594a5e-564f-45ad-acef-35bc3706d117';
  _ruy UUID := 'c81b9468-9ec3-414d-a5d6-03dc6a061f73';

  -- Cycles
  _c_t1 UUID;
  _c_t2 UUID;
  _c_t3 UUID;
  _c_t4 UUID;

  -- Objectives
  _obj UUID;
BEGIN
  -- ========================================================================
  -- 0. Clean existing OKR data for this tenant (cascade-safe order)
  -- ========================================================================
  DELETE FROM okr_comments  WHERE tenant_id = _tid;
  DELETE FROM okr_checkins  WHERE tenant_id = _tid;
  DELETE FROM okr_key_results WHERE tenant_id = _tid;
  DELETE FROM okr_objectives WHERE tenant_id = _tid;
  DELETE FROM okr_cycles     WHERE tenant_id = _tid;

  RAISE NOTICE 'Cleaned existing OKR data for tenant %', _tid;

  -- ========================================================================
  -- 1. Insert 4 Quarterly Cycles (T1–T4 2026)
  -- ========================================================================
  INSERT INTO okr_cycles (tenant_id, name, start_date, end_date, is_active)
  VALUES (_tid, 'T1 2026', '2026-01-01', '2026-03-31', true)
  RETURNING id INTO _c_t1;

  INSERT INTO okr_cycles (tenant_id, name, start_date, end_date, is_active)
  VALUES (_tid, 'T2 2026', '2026-04-01', '2026-06-30', false)
  RETURNING id INTO _c_t2;

  INSERT INTO okr_cycles (tenant_id, name, start_date, end_date, is_active)
  VALUES (_tid, 'T3 2026', '2026-07-01', '2026-09-30', false)
  RETURNING id INTO _c_t3;

  INSERT INTO okr_cycles (tenant_id, name, start_date, end_date, is_active)
  VALUES (_tid, 'T4 2026', '2026-10-01', '2026-12-31', false)
  RETURNING id INTO _c_t4;

  RAISE NOTICE 'Inserted 4 cycles: T1=% T2=% T3=% T4=%', _c_t1, _c_t2, _c_t3, _c_t4;

  -- ========================================================================
  -- 2. Insert 14 Objectives + their Key Results
  -- ========================================================================

  -- ======== OBJ 1: Ampliar a Base de Fornecedores Qualificados ========
  -- Status: Nos trilhos | Deadline: 2026-12-31 | Trimestres: T1-T4
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Ampliar a Base de Fornecedores Qualificados',
          'Responsavel: Todos | Trimestres: T1-T4 2026 | Deadline: 31/12/2026',
          'company', '2026', 'active', _marco, 0, _c_t1, 1, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'KR1A - Marketing: 30 parceiros mapeados e qualificados', 'number', 0, 0, 30, 'parceiros', 'on_track', 'active', 1);


  -- ======== OBJ 2: Definir Papeis e Responsabilidades (RACI) ========
  -- Status: Nos trilhos | Deadline: 2026-01-31 | Trimestre: T1 | Notes: Marco e Ruy
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Definir Papeis e Responsabilidades (RACI)',
          'Responsavel: Marco e Ruy | Trimestre: T1 2026 | Deadline: 31/01/2026',
          'company', '2026-Q1', 'active', _marco, 17, _c_t1, 2, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Criar matriz RACI de cada funcionario', 'boolean', 0, 0.5, 1, NULL, 'on_track', 'active', 1),
    (_tid, _obj, 'KR1 - Mapear RACI de 100% das funcoes e responsabilidades', 'number', 0, 0, 12, 'funcoes', 'on_track', 'active', 2),
    (_tid, _obj, 'KR2 - Garantir que 100% do time saiba suas responsabilidades no dia a dia', 'number', 0, 0, 12, 'pessoas', 'on_track', 'active', 3);


  -- ======== OBJ 3: Priorizacao da Marca TBO ========
  -- Status: Nos trilhos | Deadline: 2026-01-31 | Trimestre: T1
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Garantir prioridade de marca nos projetos de design',
          'Responsavel: Todos | Trimestre: T1 2026 | Deadline: 31/01/2026',
          'company', '2026-Q1', 'active', _marco, 50, _c_t1, 3, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Garantir prioridade da marca em 4 projetos-chave de design', 'number', 0, 2, 4, 'projetos', 'on_track', 'active', 1);


  -- ======== OBJ 4: Aumentar a eficiencia da producao integrando IA ========
  -- Status: Nao iniciado | Deadline: 2026-06-30 | Trimestres: T1-T2
  -- 7 KRs no Notion, 1 deleted (Contratar especialista IA) → 6 active
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Aumentar a eficiencia da producao integrando IA',
          'Responsavel: Marco | Trimestres: T1+T2 2026 | Deadline: 30/06/2026',
          'company', '2026-H1', 'active', _marco, 26, _c_t1, 4)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'KR1A — Branding: IA integrada na estrategia e desenvolvimento de marca', 'number', 8, 8, 15, 'jobs', 'on_track', 'active', 1),
    (_tid, _obj, 'KR1B — Digital 3D: IA integrada nas pre-visualizacoes e variacoes', 'number', 7, 7, 15, 'jobs', 'on_track', 'active', 2),
    (_tid, _obj, 'KR1C — Marketing: IA integrada na criacao e producao de conteudo', 'number', 8, 8, 15, 'jobs', 'on_track', 'active', 3),
    (_tid, _obj, 'KR2A — Branding: Padronizacao de IA por atividade', 'number', 0, 0, 23, 'templates', 'on_track', 'active', 4),
    (_tid, _obj, 'KR2B — Digital 3D: Padronizacao de IA por atividade', 'number', 0, 0, 10, 'templates', 'on_track', 'active', 5),
    (_tid, _obj, 'KR3C — Marketing: Padronizacao de IA por atividade', 'number', 0, 0, 30, 'prompts', 'on_track', 'active', 6);


  -- ======== OBJ 5: Fortalecer Cultura & Gestao de Pessoas ========
  -- Status: Nos trilhos | Deadline: 2026-11-30 | Trimestres: T1-T4
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Fortalecer Cultura & Gestao de Pessoas',
          'Responsavel: Todos | Trimestres: T1-T4 2026 | Deadline: 30/11/2026',
          'company', '2026', 'active', _marco, 5, _c_t1, 5, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'KR1 – Realizar All Hands mensais', 'number', 0, 0, 12, 'reunioes', 'on_track', 'active', 1),
    (_tid, _obj, 'KR2 - Realizar Workshops de Cultura trimestrais', 'number', 0, 0, 4, 'workshops', 'on_track', 'active', 2),
    (_tid, _obj, 'KR3A – Ritual Semanal (Branding)', 'number', 0, 3, 40, 'reunioes', 'on_track', 'active', 3),
    (_tid, _obj, 'KR3B – Ritual Semanal (Marketing)', 'number', 0, 3, 40, 'reunioes', 'on_track', 'active', 4),
    (_tid, _obj, 'KR3C – Ritual Semanal (Digital 3D)', 'number', 0, 3, 40, 'reunioes', 'on_track', 'active', 5);


  -- ======== OBJ 6: Criar avaliacao de performance e progressao de carreira ========
  -- Status: Nao iniciado | Deadline: 2026-03-31 | Trimestre: T1
  -- 4 KRs no Notion, 2 deleted → 2 active
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Criar avaliacao de performance e progressao de carreira',
          'Responsavel: Ruy | Trimestre: T1 2026 | Deadline: 31/03/2026',
          'company', '2026-Q1', 'active', _ruy, 0, _c_t1, 6)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'KR1 - 100% do time avaliado com PDI definido', 'number', 0, 0, 9, 'pessoas', 'on_track', 'active', 1),
    (_tid, _obj, 'KR2 - 100% dos colaboradores com trilha de desenvolvimento definida', 'number', 0, 0, 9, 'pessoas', 'on_track', 'active', 2);


  -- ======== OBJ 7: Refinar Jornada do Cliente e Metodologia de Entregas ========
  -- Status: Nos trilhos | Deadline: 2026-02-28 | Trimestre: T1
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Refinar Jornada do Cliente e Metodologia de Entregas',
          'Responsavel: Marco | Trimestre: T1 2026 | Deadline: 28/02/2026',
          'company', '2026-Q1', 'active', _marco, 0, _c_t1, 7, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Criar metodologia de entrega e onboarding para o cliente', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1),
    (_tid, _obj, 'Criar briefing padrao para reduzir em 40% os ajustes nos projetos', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 2),
    (_tid, _obj, 'Criar Template Padrao por tipo de atividade', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 3);


  -- ======== OBJ 8: Otimizar a Gestao Financeira ========
  -- Status: Nos trilhos | Deadline: 2026-03-31 | Trimestre: T1
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Otimizar a Gestao Financeira e Fluxo de Caixa',
          'Responsavel: Ruy | Trimestre: T1 2026 | Deadline: 31/03/2026',
          'company', '2026-Q1', 'active', _ruy, 0, _c_t1, 8, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Estruturar fluxo de caixa e controles financeiros', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1);


  -- ======== OBJ 9: Fortalecer posicionamento da marca TBO ========
  -- Status: Nao iniciado | Deadline: 2026-01-31 | Trimestre: T1
  -- 3 KRs no Notion, 1 deleted (Executar melhorias branding) → 2 active
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Fortalecer posicionamento da marca TBO',
          'Responsavel: Todos | Trimestre: T1 2026 | Deadline: 31/01/2026',
          'company', '2026-Q1', 'active', _marco, 0, _c_t1, 9)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Consistencia do posicionamento da marca em todos os pontos de contato', 'number', 0, 0, 7, 'pontos', 'on_track', 'active', 1),
    (_tid, _obj, 'KR3 — Percepcao de valor da marca pelos clientes', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 2);


  -- ======== OBJ 10: Expandir Presenca Comercial e Pipeline ========
  -- Status: Nao iniciado | Deadline: 2026-06-30 | Trimestres: T1-T2
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Expandir Presenca Comercial e Pipeline de Oportunidades',
          'Responsavel: Marco e Ruy | Trimestres: T1+T2 2026 | Deadline: 30/06/2026',
          'company', '2026-H1', 'active', _marco, 0, _c_t1, 10)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Realizar viagens estrategicas para abertura de mercado', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1),
    (_tid, _obj, 'Melhorar Performance Comercial', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 2),
    (_tid, _obj, 'Contratacao de 01 SDR', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 3);


  -- ======== OBJ 11: Implementar Ciclo de Campanhas Trimestrais ========
  -- Status: Nos trilhos | Deadline: 2026-12-31 | Trimestres: T1-T4
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order, status_override)
  VALUES (_tid, 'Implementar Ciclo de Campanhas Trimestrais',
          'Responsavel: Marketing | Trimestres: T1-T4 2026 | Deadline: 31/12/2026',
          'company', '2026', 'active', _marco, 0, _c_t1, 11, 'on_track')
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Executar 1 campanha de marketing e vendas por trimestre', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1);


  -- ======== OBJ 12: Fortalecer o Ecossistema de Indicacoes ========
  -- Status: Nao iniciado | Deadline: 2026-06-30 | Trimestre: T2
  -- 4 KRs no Notion, 1 deleted (Estruturar programa pontos) → 3 active
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Fortalecer o Ecossistema de Indicacoes',
          'Responsavel: Todos | Trimestre: T2 2026 | Deadline: 30/06/2026',
          'company', '2026-Q2', 'active', _marco, 0, _c_t2, 12)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Programa de indicacoes operacional com 100% dos colaboradores participando', 'percentage', 0, 0, 100, '%', 'on_track', 'active', 1),
    (_tid, _obj, 'Alcancar 5 parceiros ativos no programa de indicacoes', 'number', 0, 0, 5, 'parceiros', 'on_track', 'active', 2),
    (_tid, _obj, 'Alcancar 5 indicacoes qualificadas no trimestre', 'number', 0, 0, 5, 'indicacoes', 'on_track', 'active', 3);


  -- ======== OBJ 13: Atingir 100% de Aderencia aos Processos ========
  -- Status: Nao iniciado | Deadline: 2026-06-30 | Trimestre: T2
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Atingir 100% de Aderencia aos Processos e Sistemas Internos',
          'Responsavel: Marco | Trimestre: T2 2026 | Deadline: 30/06/2026',
          'company', '2026-Q2', 'active', _marco, 0, _c_t2, 13)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Otimizar treinamentos e padronizacao no Notion', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1);


  -- ======== OBJ 14: Profissionalizar Gestao de Pessoas ========
  -- Status: Nao iniciado | Deadline: 2026-03-31 | Trimestre: T3
  INSERT INTO okr_objectives (tenant_id, title, description, level, period, status, owner_id, progress, cycle_id, sort_order)
  VALUES (_tid, 'Profissionalizar Gestao de Pessoas',
          'Responsavel: Ruy | Trimestre: T3 2026 | Deadline: 31/03/2026',
          'company', '2026-Q3', 'active', _ruy, 0, _c_t3, 14)
  RETURNING id INTO _obj;

  INSERT INTO okr_key_results (tenant_id, objective_id, title, metric_type, start_value, current_value, target_value, unit, confidence, status, sort_order)
  VALUES
    (_tid, _obj, 'Estruturar plano de carreira e revisar contratos', 'boolean', 0, 0, 1, NULL, 'on_track', 'active', 1);


  -- ========================================================================
  -- 3. Summary
  -- ========================================================================
  RAISE NOTICE 'OKR re-seed complete: 4 cycles, 14 objectives, 33 key results inserted.';
  RAISE NOTICE 'Skipped 5 deleted KRs from Notion.';
  RAISE NOTICE 'Active cycle: T1 2026 (% to %)', '2026-01-01', '2026-03-31';
END $$;

-- ============================================================================
-- FIM da Migration 068
-- ============================================================================
