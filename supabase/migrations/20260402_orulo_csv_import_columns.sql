-- ---------------------------------------------------------------------------
-- Migration: Adicionar colunas para import CSV Órulo (contato, comissão, docs)
-- ---------------------------------------------------------------------------
-- Os CSVs exportados da Órulo trazem campos extras não cobertos pela API:
-- contato comercial, comissões PJ/PF, documentos (tabelas, books, folders).
-- ---------------------------------------------------------------------------

-- Preço máximo (complementa min_price existente)
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS max_price numeric(14,2);

-- Contato comercial
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS contact_whatsapp text;

-- Comissões
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS commission_pj numeric(5,2);
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS commission_pf numeric(5,2);

-- Dormitórios / suítes / vagas (como texto pois CSV traz ranges)
-- Os campos min_bedrooms/max_bedrooms já existem, mas CSV traz como texto simples
-- Vamos usar os existentes

-- Documentos do empreendimento (PDFs: tabelas de preço, books, folders, apresentações)
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{}'::jsonb;

-- Data de lançamento como texto (CSV traz dd/mm/yyyy, pode ser imprecisa)
-- launch_date já existe como timestamptz, vamos usar

-- Origem do dado (api vs csv_import)
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'api';

-- Região de importação (para filtro rápido: curitiba, pr, sp, rj, sc)
ALTER TABLE orulo_buildings ADD COLUMN IF NOT EXISTS import_region text;

-- Index para filtro por região
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_import_region ON orulo_buildings(import_region);
CREATE INDEX IF NOT EXISTS idx_orulo_buildings_data_source ON orulo_buildings(data_source);
