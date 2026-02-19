-- ============================================================================
-- TBO OS — Migracao de Usuarios Existentes para o Sistema de Onboarding
-- ============================================================================
--
-- COMO EXECUTAR:
-- 1. Primeiro execute database/schema.sql para criar as tabelas
-- 2. Depois execute este script no SQL Editor do Supabase
-- 3. Ajuste os dados abaixo conforme necessario (emails, cargos, datas)
--
-- IMPORTANTE:
-- - Usuarios existentes recebem status = 'ativo' (ja tem acesso ao sistema)
-- - tipo_onboarding = 'reduzido' (precisam fazer o onboarding de 3 dias)
-- - O onboarding reduzido nao bloqueia acesso — exibe apenas um banner
-- - auth_user_id sera preenchido automaticamente pelo trigger handle_new_user
--   quando o usuario fizer login via Supabase Auth
-- ============================================================================

-- ── Inserir usuarios existentes ───────────────────────────────────────────────
-- Substitua os dados abaixo pelos dados reais dos colaboradores

INSERT INTO colaboradores (nome, email, cargo, tipo_contrato, perfil_acesso, data_inicio, status, tipo_onboarding)
VALUES
  -- Diretoria (admins)
  ('Marco Andolfato', 'marco@agenciatbo.com.br', 'Diretor Criativo e Estrategia', 'PJ', 'admin', '2019-01-01', 'ativo', 'reduzido'),
  ('Ruy Lima', 'ruy@agenciatbo.com.br', 'Diretor Comercial', 'PJ', 'admin', '2019-01-01', 'ativo', 'reduzido'),

  -- Coordenadores (gestores)
  ('Carol', 'carol@agenciatbo.com.br', 'Assistente', 'CLT', 'gestor', '2023-01-01', 'ativo', 'reduzido'),
  ('Nathalia', 'nath@agenciatbo.com.br', 'Coordenadora de Atendimento', 'CLT', 'gestor', '2022-01-01', 'ativo', 'reduzido'),

  -- Project Owners (colaboradores)
  ('Nelson', 'nelson@agenciatbo.com.br', 'PO Branding', 'PJ', 'colaborador', '2023-01-01', 'ativo', 'reduzido'),
  ('Rafa', 'rafa@agenciatbo.com.br', 'PO Marketing', 'PJ', 'colaborador', '2023-06-01', 'ativo', 'reduzido'),
  ('Danniel', 'dann@agenciatbo.com.br', 'PO Digital 3D', 'PJ', 'colaborador', '2023-01-01', 'ativo', 'reduzido'),

  -- Comercial
  ('Gustavo', 'gustavo@agenciatbo.com.br', 'Comercial', 'PJ', 'colaborador', '2024-01-01', 'ativo', 'reduzido'),

  -- Artistas
  ('Celso', 'celso@agenciatbo.com.br', 'Artista 3D', 'PJ', 'colaborador', '2023-01-01', 'ativo', 'reduzido'),
  ('Erick', 'erick@agenciatbo.com.br', 'Artista 3D', 'PJ', 'colaborador', '2023-06-01', 'ativo', 'reduzido'),
  ('Duda', 'duda@agenciatbo.com.br', 'Artista 3D', 'PJ', 'colaborador', '2024-01-01', 'ativo', 'reduzido'),
  ('Tiago M.', 'tiago@agenciatbo.com.br', 'Artista 3D', 'PJ', 'colaborador', '2024-01-01', 'ativo', 'reduzido'),
  ('Mariane', 'mari@agenciatbo.com.br', 'Animadora', 'PJ', 'colaborador', '2024-01-01', 'ativo', 'reduzido'),
  ('Lucca', 'lucca@agenciatbo.com.br', 'Analista de Marketing', 'PJ', 'colaborador', '2024-06-01', 'ativo', 'reduzido'),

  -- Financeiro (terceirizado)
  ('Financa Azul', 'financeiro@agenciatbo.com.br', 'Financeiro', 'PJ', 'colaborador', '2023-01-01', 'ativo', 'reduzido')

ON CONFLICT (email) DO NOTHING;

-- ── Configurar buddies (opcional) ─────────────────────────────────────────────
-- Descomente e ajuste conforme a estrutura de buddies desejada
/*
UPDATE colaboradores SET buddy_id = (SELECT id FROM colaboradores WHERE email = 'marco@agenciatbo.com.br')
WHERE email IN ('nelson@agenciatbo.com.br', 'dann@agenciatbo.com.br');

UPDATE colaboradores SET buddy_id = (SELECT id FROM colaboradores WHERE email = 'ruy@agenciatbo.com.br')
WHERE email IN ('gustavo@agenciatbo.com.br', 'rafa@agenciatbo.com.br');

UPDATE colaboradores SET buddy_id = (SELECT id FROM colaboradores WHERE email = 'nath@agenciatbo.com.br')
WHERE email IN ('carol@agenciatbo.com.br', 'celso@agenciatbo.com.br', 'erick@agenciatbo.com.br');
*/

-- ── Liberar onboarding reduzido para usuarios existentes ──────────────────────
-- Isso permite que eles facam o onboarding de 3 dias quando acessarem a plataforma
-- O dia 1 ja e liberado automaticamente

INSERT INTO onboarding_dias_liberados (colaborador_id, dia_id)
SELECT c.id, d.id
FROM colaboradores c
CROSS JOIN onboarding_dias d
WHERE c.tipo_onboarding = 'reduzido'
  AND c.status = 'ativo'
  AND d.tipo_onboarding = 'reduzido'
  AND d.numero = 1
ON CONFLICT (colaborador_id, dia_id) DO NOTHING;

-- ============================================================================
-- VERIFICACAO: Confirme que os dados foram inseridos corretamente
-- ============================================================================
-- SELECT nome, email, cargo, perfil_acesso, status, tipo_onboarding FROM colaboradores ORDER BY perfil_acesso, nome;
