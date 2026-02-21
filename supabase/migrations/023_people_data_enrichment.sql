-- ============================================================================
-- TBO OS — Migration 023: People Data Enrichment (P1)
-- Adiciona colunas de endereço, nascimento, nível e popula dados reais
-- extraídos do Notion (BD Time TBO + Banco de Endereços).
-- Idempotente: seguro re-executar.
-- ============================================================================

-- ============================================================================
-- 1. Novas colunas em profiles (endereço, nascimento, nível, próximo nível)
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
    ALTER TABLE profiles ADD COLUMN birth_date DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address_street') THEN
    ALTER TABLE profiles ADD COLUMN address_street TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address_number') THEN
    ALTER TABLE profiles ADD COLUMN address_number TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address_city') THEN
    ALTER TABLE profiles ADD COLUMN address_city TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address_state') THEN
    ALTER TABLE profiles ADD COLUMN address_state TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address_cep') THEN
    ALTER TABLE profiles ADD COLUMN address_cep TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nivel_atual') THEN
    ALTER TABLE profiles ADD COLUMN nivel_atual TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'proximo_nivel') THEN
    ALTER TABLE profiles ADD COLUMN proximo_nivel TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'media_avaliacao') THEN
    ALTER TABLE profiles ADD COLUMN media_avaliacao NUMERIC(5,2);
  END IF;
END $$;

-- ============================================================================
-- 2. Indexes para novas colunas
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_profiles_address_city ON profiles(address_city);
CREATE INDEX IF NOT EXISTS idx_profiles_nivel_atual ON profiles(nivel_atual);

-- ============================================================================
-- 3. Enriquecimento de dados — UPDATEs por profile
-- Fonte: Notion BD Time TBO + Banco de Endereços
-- ============================================================================

-- Tenant TBO: tenant_id do primeiro tenant (para filtrar corretamente)
-- Os UPDATEs usam o profile.id diretamente (obtido do Supabase)

-- ── Marco Andolfato ──────────────────────────────────────────────
-- Notion BD Time: Diretor, Entrada 15/11/2019, Salário R$ 7.500, Sênior I, Área: Operação + RH
-- Notion Endereços: (41) 996788999, Curitiba/PR, Nasc: 27/12/1993
UPDATE profiles SET
  full_name = 'Marco Andolfato',
  cargo = 'Diretor',
  salary_pj = 7500.00,
  contract_type = 'pj',
  start_date = '2019-11-15',
  phone = '(41) 996788999',
  birth_date = '1993-12-27',
  address_street = 'R. Cel. Pretextato Pena Forte Taborda Ribas',
  address_number = '266 - Apto 13',
  address_city = 'Curitiba',
  address_state = 'Paraná',
  address_cep = '80310-260',
  nivel_atual = 'Sênior I',
  proximo_nivel = 'Sênior II',
  bu = 'Operação',
  updated_at = now()
WHERE id = '46594a5e-564f-45ad-acef-35bc3706d117';

-- ── Nelson ──────────────────────────────────────────────────────
-- Notion BD Time: PO | Branding, Entrada 15/06/2024, Salário R$ 3.000, Pleno I, Média 51%
-- Notion Endereços: (41) 99677-8867, Curitiba/PR, Nasc: 06/05/1994
UPDATE profiles SET
  full_name = 'Nelson Mozart Weigang Neto',
  cargo = 'PO | Branding',
  salary_pj = 3000.00,
  contract_type = 'pj',
  start_date = '2024-06-15',
  phone = '(41) 99677-8867',
  birth_date = '1994-05-06',
  address_street = 'R. Conselheiro Laurindo',
  address_number = '63 - Apto 43',
  address_city = 'Curitiba',
  address_state = 'Paraná',
  address_cep = '80060-100',
  nivel_atual = 'Pleno I',
  proximo_nivel = 'Pleno III',
  media_avaliacao = 51.00,
  updated_at = now()
WHERE id = '9919855f-0692-424a-bd91-19617fc89dc8';

-- ── Nathalia ──────────────────────────────────────────────────────
-- Notion BD Time: PO | Digital 3D, Entrada 01/11/2023, Salário R$ 4.500, Pleno I, Média 47%
-- Notion Endereços: (11) 9 3482-9569, São Caetano do Sul/SP, Nasc: 05/03/1997
UPDATE profiles SET
  full_name = 'Nathália Runge Martins Rodrigues',
  cargo = 'PO | Digital 3D',
  salary_pj = 4500.00,
  contract_type = 'pj',
  start_date = '2023-11-01',
  phone = '(11) 93482-9569',
  birth_date = '1997-03-05',
  address_street = 'R. Wenceslau Brás',
  address_number = '231 - Apto 102B',
  address_city = 'São Caetano do Sul',
  address_state = 'São Paulo',
  address_cep = '09541-200',
  nivel_atual = 'Pleno I',
  proximo_nivel = 'Pleno II',
  media_avaliacao = 47.00,
  updated_at = now()
WHERE id = 'd3783b0b-3bd6-492e-9b8f-b0cc8c6c235c';

-- ── Celso F. ──────────────────────────────────────────────────────
-- Notion BD Time: Designer, Entrada 25/07/2024, Salário R$ 1.500, Jr. III, Média 44%
-- Notion Endereços: São Bernardo/MA (sem telefone)
UPDATE profiles SET
  full_name = 'Celso Fernando dos S. Rodrigues',
  cargo = 'Designer',
  salary_pj = 1500.00,
  contract_type = 'pj',
  start_date = '2024-07-25',
  address_street = 'Rua São Bernardo',
  address_number = '121',
  address_city = 'São Bernardo',
  address_state = 'Maranhão',
  nivel_atual = 'Jr. III',
  proximo_nivel = 'Pleno I',
  media_avaliacao = 44.00,
  updated_at = now()
WHERE id = '44ed986f-8cc8-4123-9b76-890242a700ba';

-- ── Carol ──────────────────────────────────────────────────────
-- Notion BD Time: Assistente + Coordenadora, Entrada 01/02/2024, Salário R$ 3.800, Jr. I
-- Notion Endereços: sem registro encontrado
UPDATE profiles SET
  full_name = 'Carol',
  cargo = 'Assistente / Coordenadora',
  salary_pj = 3800.00,
  contract_type = 'pj',
  start_date = '2024-02-01',
  bu = 'Pós Vendas',
  nivel_atual = 'Jr. I',
  proximo_nivel = 'Jr. II',
  is_coordinator = true,
  updated_at = now()
WHERE id = '3232ffc4-ba12-4a15-82a2-3db8b8ec926d';

-- ── Tiago M. ──────────────────────────────────────────────────────
-- Notion BD Time: Artista 3D, Entrada 24/07/2024, Salário R$ 3.000, Pleno I, Média 46%
-- Notion Endereços: Lúcio Tiago = (92) 98416-3000, Manaus/AM, Nasc: 27/11/1991
UPDATE profiles SET
  full_name = 'Lúcio Tiago Maurilo Torres',
  cargo = 'Artista 3D',
  salary_pj = 3000.00,
  contract_type = 'pj',
  start_date = '2024-07-24',
  phone = '(92) 98416-3000',
  birth_date = '1991-11-27',
  address_street = 'R. Coremas',
  address_number = '4',
  address_city = 'Manaus',
  address_state = 'Amazonas',
  address_cep = '69097-620',
  nivel_atual = 'Pleno I',
  proximo_nivel = 'Pleno II',
  media_avaliacao = 46.00,
  updated_at = now()
WHERE id = '24b3d5f9-63a0-4a69-988b-feb87ea3daaa';

-- ── Eduarda (Duda) ──────────────────────────────────────────────
-- Notion BD Time: Artista 3D, Entrada 15/11/2024, Jr. III
-- Notion Endereços: (41) 99729-6525, Curitiba/PR, Nasc: 29/04/1999
UPDATE profiles SET
  full_name = 'Eduarda Monique Anad',
  cargo = 'Artista 3D',
  contract_type = 'pj',
  start_date = '2024-11-15',
  phone = '(41) 99729-6525',
  birth_date = '1999-04-29',
  address_street = 'R. Sergipe',
  address_number = '899 - Sobrado 3',
  address_city = 'Curitiba',
  address_state = 'Paraná',
  address_cep = '80630-080',
  nivel_atual = 'Jr. III',
  proximo_nivel = 'Pleno I',
  updated_at = now()
WHERE id = '256c8ed6-7ffd-438a-beae-4b7a302343c7';

-- ── Lucca ──────────────────────────────────────────────────────
-- Notion BD Time: Assistente, Entrada 15/05/2025, BU Marketing
-- Notion Endereços: sem registro encontrado
UPDATE profiles SET
  full_name = 'Lucca',
  cargo = 'Assistente',
  contract_type = 'pj',
  start_date = '2025-05-15',
  updated_at = now()
WHERE id = 'e1dcb101-7c51-493a-860c-d6eac1bacc6e';

-- ── Gustavo ──────────────────────────────────────────────────────
-- Notion BD Time: sem registro na BD Time (só no Banco de Endereços)
-- Notion Endereços: (41) 99610-5227, Curitiba/PR, Nasc: 20/02/1994
UPDATE profiles SET
  full_name = 'Gustavo Bientinezi',
  contract_type = 'pj',
  phone = '(41) 99610-5227',
  birth_date = '1994-02-20',
  address_street = 'R. Salustiano Cordeiro',
  address_number = '74',
  address_city = 'Curitiba',
  address_state = 'Paraná',
  address_cep = '80620-190',
  updated_at = now()
WHERE id = '9b8ef924-0152-4568-93f0-ebc4408c804b';

-- ── Rafa ──────────────────────────────────────────────────────
-- Notion BD Time: sem registro encontrado
-- Notion Endereços: sem registro encontrado
-- Mantido com dados mínimos (já tem bu=Marketing, role=project_owner)
UPDATE profiles SET
  contract_type = 'pj',
  updated_at = now()
WHERE id = '044e983c-bb73-4db0-8d63-68ee2bc91ec8'
  AND contract_type IS NULL;

-- ── Ruy Lima ──────────────────────────────────────────────────────
-- Notion BD Time: sem registro encontrado
-- Notion Endereços: sem registro encontrado
-- Mantido com dados mínimos (founder)
UPDATE profiles SET
  contract_type = 'pj',
  updated_at = now()
WHERE id = 'c81b9468-9ec3-414d-a5d6-03dc6a061f73'
  AND contract_type IS NULL;

-- ============================================================================
-- 4. Definir manager_id → Marco é gestor de todos
-- Marco (founder) = 46594a5e-564f-45ad-acef-35bc3706d117
-- ============================================================================

UPDATE profiles SET
  manager_id = '46594a5e-564f-45ad-acef-35bc3706d117'
WHERE id != '46594a5e-564f-45ad-acef-35bc3706d117'
  AND id != 'c81b9468-9ec3-414d-a5d6-03dc6a061f73'
  AND manager_id IS NULL;

-- ============================================================================
-- 5. Atribuir team_id para profiles que ainda não têm
-- Carol → sem time definido (Pós Vendas não tem team)
-- Marco → Operação (sem team, é founder)
-- ============================================================================

-- Carol: atribuir team de Audiovisual não existe, manter sem team por ora

-- ============================================================================
-- 6. Registrar no collaborator_history as mudanças feitas
-- ============================================================================

-- Registrar que salários foram preenchidos a partir do Notion
INSERT INTO collaborator_history (user_id, tenant_id, field_changed, old_value, new_value, changed_at)
SELECT
  p.id,
  p.tenant_id,
  'salary_pj',
  NULL,
  p.salary_pj::TEXT,
  now()
FROM profiles p
WHERE p.salary_pj IS NOT NULL
  AND p.tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM collaborator_history ch
    WHERE ch.user_id = p.id
      AND ch.field_changed = 'salary_pj'
      AND ch.new_value = p.salary_pj::TEXT
  );

-- ============================================================================
-- FIM da Migration 023
-- ============================================================================
